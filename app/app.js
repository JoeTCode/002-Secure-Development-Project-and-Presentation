import express from 'express'
import { pool } from './db.js';
import bodyParser from 'body-parser';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL database.'))
  .catch(err => console.error('Database connection error:', err));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Landing page
app.get('/', (req, res) => {
    /// send the static file
    res.sendFile(__dirname + '/public/html/login.html', (err) => {
        if (err){
            console.log(err);
        }
    })
});

// Reset login_attempt.json when server restarts
let login_attempt = {"username" : "null", "password" : "null"};
let data = JSON.stringify(login_attempt);
fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);

// Store who is currently logged in
let currentUser = null;

// Register POST request
app.post('/register', async (req, res) => {
    const email = req.body.email_input;
    const username = req.body.username_input;
    const password = req.body.password_input;
    if (!email|| !username || !password) {
        return res.sendFile(__dirname + '/public/html/register.html', (err) => {
            if (err){
                console.log(err);
            };
        });
    }
    const sql = 'INSERT INTO users(email, username, password) VALUES($1, $2, $3) RETURNING *';
    const values = [email, username, password];
    try {
        const result = await pool.query(sql, values)
        // Redirect to login page
        res.sendFile(__dirname + '/public/html/login.html', (err) => {
            if (err){
                console.log(err);
            };
        });
    } catch (err) {
        console.log(err);
        // Redirect back to register page
        res.sendFile(__dirname + '/public/html/register.html', (err) => {
            if (err) {
                console.log(err);
            };
        });
    };
})

// Login POST request
app.post('/', async function(req, res){

    // Get username and password entered from user
    var username = req.body.username_input;
    var password = req.body.password_input;

    try {
        const sql = 'SELECT * FROM users WHERE username=$1 AND password=$2';
        const values = [username, password];
        const result = await pool.query(sql, values);

        if (result.rows.length > 0) {

            currentUser = username;
            // Set login details
            let login_attempt = {"username" : username, "password" : password};
            let data = JSON.stringify(login_attempt);
            fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);
            
            // Redirect to home page
            res.sendFile(__dirname + '/public/html/index.html', (err) => {
                if (err){
                    console.log(err);
                };
            });
        } else {
            // Redirect to back to login page
            res.sendFile(__dirname + '/public/html/login.html', (err) => {
                if (err){
                    console.log(err);
                };
            });
        };
    } catch (err) {
        console.log(err);
    };

    /*
    // Currently only "username" is a valid username
    if(username !== "username") {

        // Update login_attempt with credentials used to log in
        let login_attempt = {"username" : username, "password" : password};
        let data = JSON.stringify(login_attempt);
        fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);

        // Redirect back to login page
        res.sendFile(__dirname + '/public/html/login.html', (err) => {
            if (err){
                console.log(err);
            }
        });
    }

    // Currently only "password" is a valid password
    if(password !== "password") {

        // Update login_attempt with credentials used to log in
        let login_attempt = {"username" : username, "password" : password};
        let data = JSON.stringify(login_attempt);
        fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);

        // Redirect back to login page
        res.sendFile(__dirname + '/public/html/login.html', (err) => {
            if (err){
                console.log(err);
            }
        });
    }

    // Valid username and password both entered together
    if(username === "username" && password === "password") {
        // Update login_attempt with credentials
        let login_attempt = {"username" : username, "password" : password};
        let data = JSON.stringify(login_attempt);
        fs.writeFileSync(__dirname + '/public/json/login_attempt.json', data);

        // Update current user upon successful login
        currentUser = req.body.username_input;

        // Redirect to home page
        res.sendFile(__dirname + '/public/html/index.html', (err) => {
            if (err){
                console.log(err);
            }
        })
    }
    */
});

// Make a post POST request
app.post('/makepost', async function(req, res) {
    
    // Read in current posts
    // const json = fs.readFileSync(__dirname + '/public/json/posts.json');
    // var posts = JSON.parse(json);

    // Get the current date
    let curDate = new Date();
    curDate = curDate.toLocaleString("en-GB");

    // Find post with the highest ID
    // let maxId = 0;
    // for (let i = 0; i < posts.length; i++) {
    //     if (posts[i].postId > maxId) {
    //         maxId = posts[i].postId;
    //     }
    // }

    // Initialise ID for a new post
    let newId = 0;

    // If postId is empty, user is making a new post
    if (req.body.postId == "") {
        const sql = 'INSERT INTO posts(username, title, content, date_published) VALUES($1, $2, $3, NOW()) RETURNING *';
        const values = [currentUser, req.body.title_field, req.body.content_field];
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

        // // Find post with the matching ID, delete it from posts so user can submit their new version
        // let index = posts.findIndex(item => item.postId == newId);
        // posts.splice(index, 1);
    }
    

    // Add post to posts.json
    // posts.push({"username": currentUser , "timestamp": curDate, "postId": newId, "title": req.body.title_field, "content": req.body.content_field});


    // fs.writeFileSync(__dirname + '/public/json/posts.json', JSON.stringify(posts));

    // Redirect back to my_posts.html
    res.sendFile(__dirname + "/public/html/my_posts.html");
 });

 // Delete a post POST request
 app.post('/deletepost', async (req, res) => {

    // // Read in current posts
    // const json = fs.readFileSync(__dirname + '/public/json/posts.json');
    // var posts = JSON.parse(json);

    // // Find post with matching ID and delete it
    // let index = posts.findIndex(item => item.postId == req.body.postId);
    // posts.splice(index, 1);

    try {
        const sql = 'DELETE from posts WHERE post_id = $1';
        const values = [req.body.postId];
        const result = await pool.query(sql, values);
    } catch (err) {
        console.log(err);
    }

    // Update posts.json
    // fs.writeFileSync(__dirname + '/public/json/posts.json', JSON.stringify(posts));

    res.sendFile(__dirname + "/public/html/my_posts.html");
 });

 app.get('/api/myposts', async (req, res) => {
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

app.get('/api/posts', async (req, res) => {
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