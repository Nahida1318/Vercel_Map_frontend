// validation.js

export const isValidEmail = (email) => {
    // Basic email validation regex
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
    // Basic password length check
    return password.length >= 6;
};
