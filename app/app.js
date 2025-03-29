import express from 'express'
import { pool } from './db.js';
import bodyParser from 'body-parser';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { cookieJwtAuth } from './middleware/cookieJwtAuth.js';

const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

// Setting EJS as the view engine
app.set('view engine', 'ejs');

// Setting the views directory (./views)
app.set('views', (__dirname + '/views'));

// Connect to Postgres db
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL database.'))
  .catch(err => console.error('Database connection error:', err));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Login page
app.get('/', (req, res) => {
    /// send the static file
    res.render('login', { errorMessage: null });
});

// Reset login_attempt.json when server restarts
// let login_attempt = {"username" : "null", "password" : "null"};
// let data = JSON.stringify(login_attempt);
// fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);


// POST routes

// Register POST request
app.post('/register', async (req, res) => {
    const email = req.body.email_input;
    const username = req.body.username_input;
    const password = req.body.password_input;
    
    if (!email|| !username || !password) {
        return res.render('register', { errorMessage: 'Invalid details.' })
    }
    
    try {
        bcrypt.hash(password, saltRounds).then(async (hashed_password) => {
            const uuid = uuidv4()
            const sql = 'INSERT INTO users(id, email, username, password) VALUES($1, $2, $3, $4) RETURNING *';
            const values = [uuid, email, username, hashed_password];
            const result = await pool.query(sql, values)
            
            // Redirect to login page
            res.render('login', { errorMessage: null });
        });

    } catch (err) {
        console.log(err);

        if (err.code == 23505) {
            return res.render('register', { errorMessage: 'Please choose a unique email or username.' })
        } 
        // Redirect back to register page
        else {
            res.render('register', { errorMessage: 'An error occurred during registration. Please try again.'})
        };
    };
})

// Login POST request
app.post('/', async (req, res) => {

    // Get username and password entered from user
    var input_username = req.body.username_input;
    var input_password = req.body.password_input;

    try {
        const sql = 'SELECT * FROM users WHERE username=$1';
        const values = [input_username];
        const result = await pool.query(sql, values);
        const hashed_password_from_db = result.rows[0].password;
        const match = await bcrypt.compare(input_password, hashed_password_from_db);
        
        if (result.rows.length > 0 && match) { // Login success

            const { id, email, username } = result.rows[0]
            const token = jwt.sign({"id": id, "email": email, "username": username}, process.env.MY_SECRET, { expiresIn: "1h" });

            // Set login details
            // let login_attempt = {"username" : username, "password" : input_password};
            // let data = JSON.stringify(login_attempt);
            // fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);
            
            res.cookie("token", token, {
                httpOnly: true,
                // secure: true,
                // maxAge: 1000000,
                // signed: true,
            });

            // Redirect to home page
            res.redirect('index');

        } else { // Login failure

            // Redirect to back to login page
            res.render('login', { errorMessage: 'Invalid username or password' });
        };

    } catch (err) {
        console.log(err);
    };
});

// Make a post POST request
app.post('/makepost', cookieJwtAuth, async (req, res) => {

    // Get the current date
    let curDate = new Date();
    curDate = curDate.toLocaleString("en-GB");

    // Initialise ID for a new post
    let newId = 0;

    // If postId is empty, user is making a new post
    if (req.body.postId == "") {
        const sql = 'INSERT INTO posts(username, title, content, date_published) VALUES($1, $2, $3, NOW()) RETURNING *';
        const values = [req.user.username, req.body.title_field, req.body.content_field];
        try {
            const result = await pool.query(sql, values);
            console.log(result);
        } catch (err) {
            console.log(err);
        }
    } 
    else { // If postID != empty, user is editing a post
        
        newId = req.body.postId;
        
        try {
            const sql = 'UPDATE posts SET title = $1, content = $2 WHERE post_id = $3';
            const values = [req.body.title_field, req.body.content_field, newId];
            const result = await pool.query(sql, values);
        } catch (err) {
            console.log(err);
        };
    }

    // Redirect back to my_posts.html
    res.render('my_posts', { user: req.user });
});

 // Delete a post POST request
 app.post('/deletepost', cookieJwtAuth, async (req, res) => {

    try {
        const sql = 'DELETE from posts WHERE post_id = $1';
        const values = [req.body.postId];
        const result = await pool.query(sql, values);
    } catch (err) {
        console.log(err);
    }

    res.render('my_posts', { user: req.user });
});


// GET routes


app.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect('/');
})

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

app.get('/index', cookieJwtAuth, (req ,res) => {
    res.render('index', { user: req.user });
})

app.get('/posts', cookieJwtAuth, (req ,res) => {
    res.render('posts', { user: req.user });
})

app.get('/my_posts', cookieJwtAuth, (req ,res) => {
    res.render('my_posts', { user: req.user });
})


// API routes

app.get('/api/myposts', cookieJwtAuth, async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username is required" });

    try {
        const sql = 'SELECT * FROM posts WHERE username = $1 ORDER BY date_published DESC';
        const values = [username];
        
        const result = await pool.query(sql, values); 
        return res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    };
});

app.get('/api/posts', cookieJwtAuth, async (req, res) => {
    try {
        const sql = 'SELECT * FROM posts ORDER BY date_published DESC';
        const result = await pool.query(sql);
        return res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    };
});

app.listen(port, () => {
    console.log(`My app listening on port ${port}!`)
});