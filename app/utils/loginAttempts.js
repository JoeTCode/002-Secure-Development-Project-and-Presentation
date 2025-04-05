export async function updateLoginAttempts(match, attempts, isFirstLoginAttempt, last_attempt, clientIp, loginLimit, isRecentAttempt, pool) {
    
    if (match) return attempts;

    if (attempts == loginLimit) attempts -=1;

    // If its not the user's first attempt
    if (!isFirstLoginAttempt) {
        // If the user's last attempt is recent, increment attempts
        if (isRecentAttempt(last_attempt, process.env.FAILED_LOGIN_RESET_WINDOW_HRS)) {
            attempts += 1
            const incrementSql = 'UPDATE login_attempts SET attempts = $1, last_attempt = NOW() WHERE ip = $2';
            const incrementValues = [attempts, clientIp];
            await pool.query(incrementSql, incrementValues);
        } 
        // If the users last login attempt was not recent, reset their attempts count to 1
        else {
            attempts = 1
            const incrementSql = 'UPDATE login_attempts SET attempts = $1, last_attempt = NOW() WHERE ip = $2';
            const incrementValues = [attempts, clientIp];
            await pool.query(incrementSql, incrementValues);
        };

    } else { // User has no recorded login attempts, we will create a new record, and set login attempts to 1
        attempts = 1
        const incrementSql = 'INSERT INTO login_attempts(ip, attempts, last_attempt) VALUES($1, $2, NOW())';
        const incrementValues = [clientIp, attempts];
        await pool.query(incrementSql, incrementValues);
    };
    return attempts;
};