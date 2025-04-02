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
import { encrypt, decrypt } from './utils/encryptDecrypt.js';
import requestIp from 'request-ip';
import { isRecentAttempt } from './utils/time.js';
import { checkReCaptcha } from './utils/reCaptcha.js';

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

// Prevents cookie from being tampered with
app.use(cookieParser(process.env.SECRET_KEY)); 

const loginLimit = process.env.LOGIN_ATTEMPT_LIMIT - 1

// Login page
app.get('/', async (req, res) => {
    
    // Get IP address of user
    const clientIp = requestIp.getClientIp(req);

    // Get users previous login attempts (if it exists)
    const checkSql = 'SELECT * FROM login_attempts WHERE ip = $1';
    const checkValue = [clientIp];
    const checkResult = await pool.query(checkSql, checkValue);

    let attempts = null;

    if (checkResult.rows[0]) {
        attempts = checkResult.rows[0].attempts;
    };

    // If user has no recorded attempts, allow normal login flow
     if (!attempts) {
        return res.render('login', { errorMessage: null, loginLimit: false });
    };
    // If attempts are below the limit allow normal login flow
    if (attempts < loginLimit) {
        return res.render('login', { errorMessage: null, loginLimit: false });
    } ;
    // IF attempts exceed limit, generate CAPTCHA 
    if (attempts >= loginLimit) {
        return res.render('login', { errorMessage: null, loginLimit: true });
    };
    
});


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
        // Password Hashing and Salting
        const hashed_password = await bcrypt.hash(password, saltRounds) 

        // Generating UUID for ID column of Users db
        const uuid = uuidv4()
        // Email encryption
        // const encryptedEmail = await encrypt(email, process.env.KEY_PASSWORD);

        const sql = 'INSERT INTO users(id, email, username, password) VALUES($1, $2, $3, $4) RETURNING *';
        const values = [uuid, email, username, hashed_password];
        const result = await pool.query(sql, values); 

        res.render('login', { errorMessage: null, loginLimit: false});                 

    } catch (err) {
        if (err.code == 23505) {
            return res.render('register', { errorMessage: 'Please choose a unique email or username.' })
        } 
        // Redirect back to register page
        else {
            return res.render('register', { errorMessage: 'An error occurred during registration. Please try again.'})
        };
    };
})

// Login POST request
app.post('/', async (req, res) => {

    // Get username and password entered from user
    var input_username = req.body.username_input;
    var input_password = req.body.password_input;

    // Get IP address of user
    const clientIp = requestIp.getClientIp(req);

    // Get ReCAPTCHA response token (if it exists)
    const responseToken = req.body['g-recaptcha-response'];
    let passedReCaptcha = true;

    let firstLoginAttempt = true;

    try {
        
        const sql = 'SELECT * FROM users WHERE username=$1';
        const values = [input_username];
        const result = await pool.query(sql, values);

        let match = false

        // Check if user password matches password in DB
        if (result.rows[0]) {
            const hashed_password_from_db = result.rows[0].password;
            match = await bcrypt.compare(input_password, hashed_password_from_db);
        }

        // Get previous login attempts
        const checkSql = 'SELECT * FROM login_attempts WHERE ip = $1';
        const checkValue = [clientIp];
        const checkResult = await pool.query(checkSql, checkValue);

        let attempts = 0;
        let last_attempt = null;

        // If previous login attempts found, set attempt details
        if (checkResult.rows[0]) {
            attempts = checkResult.rows[0].attempts;
            last_attempt = checkResult.rows[0].last_attempt;
            firstLoginAttempt = false;
        }

        // If login limit reached, no CAPTCHA was submitted and the user did not successfully login, render CAPTCHA
        if (attempts >= loginLimit && !responseToken && !match) {
            console.log('0')
            return res.render('login', { errorMessage: null, loginLimit: true });
        };

        // If the user submitted a CAPTCHA, check if they successfully completed it
        if (responseToken && attempts >= loginLimit) {
            passedReCaptcha = await checkReCaptcha(responseToken);
        };

        // If the user did not pass the CAPTCHA, re-render CAPTCHA
        if (!passedReCaptcha && attempts >= loginLimit) {
            console.log('1');
            return res.render('login', {errorMessage: null, loginLimit: true});
        };
        
        // If attempt limit reached and unsuccessful login, render reCAPTCHA
        if (attempts >= loginLimit && !match) {
            console.log('2');
            return res.render('login', { errorMessage: null, loginLimit: true });
        };

        // If user's login attempts are below the limit, but failed to login, increment the number of attempts
        if (attempts < loginLimit && !match) {
            // If its not the user's first attempt
            if (!firstLoginAttempt) {
                // If the user's last attempt is recent, increment attempts
                if (isRecentAttempt(last_attempt, process.env.FAILED_LOGIN_RESET_WINDOW_HRS)) {
                    attempts += 1
                    const incrementSql = 'UPDATE login_attempts SET attempts = $1, last_attempt = NOW() WHERE ip = $2';
                    const incrementValues = [attempts, clientIp];
                    await pool.query(incrementSql, incrementValues);
                    console.log('3');
                    return res.render('login', {errorMessage: 'Invalid username or password', loginLimit: false});

                } 
                // If the users last login attempt was not recent, reset their attempts count to 1 (as they failed to login)
                else {
                    const incrementSql = 'UPDATE login_attempts SET attempts = 1, last_attempt = NOW() WHERE ip = $1';
                    const incrementValues = [clientIp];
                    await pool.query(incrementSql, incrementValues);
                    console.log('4');
                    return res.render('login', {errorMessage: 'Invalid username or password', loginLimit: false});
                };

            } else { // User has no recorded login attempts, we will create a new record, and set login attempts to 1
                const incrementSql = 'INSERT INTO login_attempts(ip, attempts, last_attempt) VALUES($1, 1, NOW())';
                const incrementValue = [clientIp];
                await pool.query(incrementSql, incrementValue);
                console.log('5');
                return res.render('login', {errorMessage: 'Invalid username or password', loginLimit: false});
            };
            
        }

        // else if attempt == 3 or attempt < 3 AND match, then continue to login and reset limit
        
        if (match) { // Login success, reset any existing login attempts
            
            // If the user has had previous login attempts
            if (!firstLoginAttempt) {
                const resetSql = 'UPDATE login_attempts SET attempts = 0, last_attempt = NOW() WHERE ip = $1';
                const resetValue = [clientIp];
                await pool.query(resetSql, resetValue);

            } else {
                const incrementSql = 'INSERT INTO login_attempts(ip, attempts, last_attempt) VALUES($1, 0, NOW())';
                const incrementValue = [clientIp];
                await pool.query(incrementSql, incrementValue);
            }
    
            const { id, email, username } = result.rows[0]
            // const decryptedEmail = await decrypt(email, process.env.KEY_PASSWORD);
            const token = jwt.sign({"id": id, "email": email, "username": username}, process.env.MY_SECRET, { expiresIn: "30m" });
            
            res.cookie("token", token, {
                httpOnly: process.env.HTTP_ONLY,
                sameSite: process.env.SAMESITE,
                // secure: true, (ensures cookie is only sent over https)
                // maxAge: 1000000, (sets cookie timeout)
                // signed: true,
            });
            console.log('6');
            // Redirect to home page
            return res.redirect('index');
        }

    } catch (err) {
        console.error(err);
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