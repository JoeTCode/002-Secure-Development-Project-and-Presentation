import jwt from 'jsonwebtoken';

export const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('No token found in cookies');
        return res.redirect('/'); // No token, redirect to login
    }

    try {
        // Verify the JWT token with your secret
        const user = jwt.verify(token, process.env.MY_SECRET);
        
        // Attach user data to the request object so it can be used in other routes
        req.user = user;
        
        // Proceed to the next middleware/route
        next();
    } catch (err) {
        // If token verification fails or token is expired
        console.error('Token verification failed:', err.message);
        
        // Clear the invalid token from cookies
        res.clearCookie("token");
        
        // Redirect to login page
        return res.redirect('/');
    }
};
