import { passwordStrengthChecker } from '../../utils/passwordStrength.js';

const passwordValid = false;

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('password_input').addEventListener("input", validatePassword);
    document.getElementById("register_form").addEventListener("submit", validateForm);
});

console.log('hello');

function passed(dict) {
    for (key in dict) {
        if (dict[key] == false) return false
    };
    return true;
};

function renderAlertBox(passwordContainer, checkDict) {

    const alertContainer = document.createElement("div");

    for (key in checkDict) {
        const p = document.createElement("p");
        p.textContent = key;
        alertContainer.appendChild(p);
        if (checkDict[value] == true) {
            p.style.color = "green";
        } else p.style.color = "red"  
    };

    passwordContainer.appendChild(alertContainer);
}

function validatePassword() {
    const username = document.getElementById('username_input').value;
    const password = document.getElementById('password_input').value;
    const email = document.getElementById('email_input').value;
    const passwordContainer = document.getElementById('password_input');
    const checkDict = passwordStrengthChecker(password, username);

    if (passed(checkDict)) return passwordValid = true;

    renderAlertBox(passwordContainer, checkDict);
    // Fill out form fields with data grabbed from post
    // document.getElementById("email_input").value = 
    // document.getElementById("username_input").value = username;
    // document.getElementById("password_input").value = password;
}

function validateForm(e) {
    e.preventDefault();

    if (!passwordValid) return false;
    

}