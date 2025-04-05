function isUsernameInPassword(username, password) {

    password = password.toLowerCase();
    username = username.toLowerCase();

    if (password.includes(username)) return true;
    
    const contiguousCharacters = username.match(/[a-z]+/g);
    
    for (let item of contiguousCharacters) {
        if (item.length >= 4) {
            if (password.includes(item)) return true;
        };
    };
    
    return false;
};

function followsFormat(password, minLengthExceeded, maxLengthExceeded, numSpecialCharacters, numUppercaseCharacters, numLowercaseCharacters, numNumbers, isUsernameInPassword) {
    const checklist = {
        'minLengthExceeded': true, 
        'maxLengthExceeded': true,
        'isUsernameInPass': true,
        'minSpecialCharsExceeded': true, 
        'minUpperCharsExceeded': true, 
        'minLowerCharsExceeded': true, 
        'minNumsExceeded': true
    };

    if (password.length >= minLengthExceeded) {
        checklist['minLengthExceeded'] = false;
    };
    if (password.length < maxLengthExceeded) {
        checklist['maxLengthExceeded'] = false;
    };

    const special_characters = password.match(/\W/g);
    const uppercase = password.match(/[A-Z]/g);
    const lowercase = password.match(/[a-z]/g);
    const nums = password.match(/[0-9]/g);

    if (!isUsernameInPassword) {
        checklist['isUsernameInPass'] = false;
    };
    if (special_characters && special_characters.length >= numSpecialCharacters) {
        checklist['minSpecialCharsExceeded'] = false;
    };
    if (uppercase && uppercase.length >= numUppercaseCharacters) {
        checklist['minUpperCharsExceeded'] = false;
    };
    if (lowercase && lowercase.length >= numLowercaseCharacters) {
        checklist['minLowerCharsExceeded'] = false;
    };
    if (nums && nums.length >= numNumbers) {
        checklist['minNumsExceeded'] = false;
    };

    return checklist;
};

export function passwordStrengthChecker(password, username) {
    // Restrictions
    const minLength = process.env.MIN_LENGTH;
    const maxLength = process.env.MAX_LENGTH;
    const numSpecialCharacters = process.env.NUM_SPECIAL_CHARACTERS;
    const numUppercaseCharacters = process.env.NUM_UPPERCASE_CHARACTERS;
    const numLowercaseCharacters = process.env.NUM_LOWERCASE_CHARACTERS;
    const numNumbers = process.env.NUM_NUMBERS;
    const isUsernameInPass = isUsernameInPassword(password, username);

    return followsFormat(password, minLength, maxLength, numSpecialCharacters, numUppercaseCharacters, numLowercaseCharacters, numNumbers, isUsernameInPass)
};

export function passedChecker(dict) {
    for (let key in dict) {
        if (dict[key] == true) return false
    };
    return true;
};

export function createErrorMessage(dict) {
    let errorMessage = [
        '<p style="color: black;"> Please ensure the password:</p>',
        '<p style="color: green;"> - Is greater than ' + process.env.MIN_LENGTH + ' character(s) long.</p>',
        '<p style="color: green;"> - Is less than ' + process.env.MAX_LENGTH + ' character(s) long.</p>',
        '<p style="color: green;"> - Does not include any part of your username.</p>',
        '<p style="color: green;"> - Has at least ' + process.env.NUM_SPECIAL_CHARACTERS + ' special character(s), (e.g., !, @, #, $, %).</p>',
        '<p style="color: green;"> - Has at least ' + process.env.NUM_UPPERCASE_CHARACTERS + ' uppercase character(s).</p>',
        '<p style="color: green;"> - Has at least ' + process.env.NUM_LOWERCASE_CHARACTERS + ' lowercase character(s).</p>',
        '<p style="color: green;"> - Has at least ' + process.env.NUM_NUMBERS + ' numerical character(s).</p>'
    ];
    
    for (let key in dict) {
        if (dict[key]) {
            switch (key) {
                case "minLengthExceeded":
                    errorMessage[1] = '<p style="color: red;"> - Is greater than ' + process.env.MIN_LENGTH + ' character(s) long.</p>';
                    break;
                case "maxLengthExceeded":
                    errorMessage[2] = '<p style="color: red;"> - Is less than ' + process.env.MAX_LENGTH + ' character(s) long.</p>';
                    break;
                case "isUsernameInPass":
                    errorMessage[3] = '<p style="color: red;"> - Does not include any part of your username.</p>';
                    break;
                case "minSpecialCharsExceeded":
                    errorMessage[4] = '<p style="color: red;"> - Has at least ' + process.env.NUM_SPECIAL_CHARACTERS + ' special character(s), (e.g., !, @, #, $, %).</p>';
                    break;
                case "minUpperCharsExceeded":
                    errorMessage[5] = '<p style="color: red;"> - Has at least ' + process.env.NUM_UPPERCASE_CHARACTERS + ' uppercase character(s).</p>';
                    break;
                case "minLowerCharsExceeded":
                    errorMessage[6] = '<p style="color: red;"> - Has at least ' + process.env.NUM_LOWERCASE_CHARACTERS + ' lowercase character(s).</p>';
                    break;
                case "minNumsExceeded":
                    errorMessage[7] = '<p style="color: red;"> - Has at least ' + process.env.NUM_NUMBERS + ' numerical character(s).</p>';
                    break;
            };
        };
    };

    return errorMessage.join("");
};

