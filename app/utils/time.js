/**
 * 
 * @param {Date} attempt - The recorded time of the login attempt. Any valid Date constructor argument is accepted.
 * @param {Number} howRecent - The time from now in hours that decides whether a login attempt is 'recent' (1, 0,5, 0.1, etc.).
 * @returns Boolean
 */
export function isRecentAttempt(attempt, howRecent=process.env.HOW_RECENT) {
    const attemptDate = new Date(attempt);
    const now = new Date();
    
    const differenceInMs = now.getTime() - attemptDate.getTime();
    const differenceInHrs = differenceInMs/(1000*60*60);

    return (differenceInHrs < howRecent);
}