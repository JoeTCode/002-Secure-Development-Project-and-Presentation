import passport from 'passport'; // Authentication middleware for Node.js
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from '../db.js'; // Import the database connection pool

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Google OAuth Client ID from environment variable
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google OAuth Secret ID from environment variable
            callbackURL: 'http://localhost:3000/index/google/callback', //URL google will redirect to after authentication
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, displayName, emails } = profile;
                const email = emails[0]?.value;

                if (!email) {
                    return done(new Error('No email found in profile'));
                }

                // Check if user exists
                const checkUserSql = 'SELECT * FROM users WHERE email = $1';
                const checkUserValues = [email];
                const checkUserResult = await pool.query(checkUserSql, checkUserValues);

                if (checkUserResult.rows.length > 0) {
                    return done(null, checkUserResult.rows[0]);
                }

                // Generate a UUID for the user if profile.id is not a valid UUID
                const userId = uuidv4();  // Generates a new valid UUID

                // Set a default password or empty string (if password is not needed for Google login)
                const defaultPassword = '';  // or use some default value
                const newUserSql = 'INSERT INTO users(id, email, username, password) VALUES($1, $2, $3, $4) RETURNING *';
                const newUserValues = [userId, email, displayName, defaultPassword];
                const newUserResult = await pool.query(newUserSql, newUserValues);

                return done(null, newUserResult.rows[0]);
            } catch (err) {
                console.error("Error during Google Auth:", err);
                return done(err);
            }
        }
    )
);

passport.serializeUser(function(user, done) {
    // Serialize the user by saving the user's id into the session
    done(null, user.id);  // 'user.id' should be a unique identifier like UUID
});

passport.deserializeUser(async function(id, done) {
    try {
        // Retrieve the full user record from the database using the id (or username)
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);  // If user found, pass the user object to 'done'
        } else {
            done(null, false);  // If user not found, return false (deserialization failed)
        };
    } catch (err) {
        done(err);  // Pass any error to 'done'
    };
});

export default passport;