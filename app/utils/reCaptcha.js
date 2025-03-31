export async function checkReCaptcha(responseToken) {
    const params = new URLSearchParams();
    params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
    params.append('response', responseToken);

    try {
        const result = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        const data = await result.json()
        
        if (data.success) {
            //res.redirect('index');
            return true
        } //else res.redirect('login', { errorMessage: null, loginLimit: true })
        else return false

    } catch (err) {
        console.error(err);
    };
};