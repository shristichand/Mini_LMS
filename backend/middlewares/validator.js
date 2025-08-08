const { body } = require("express-validator");

const signupValidator = [
    body("name").notEmpty().withMessage("Name is required").trim().escape(),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
];

const loginValidator = [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
    signupValidator,
    loginValidator,
};
