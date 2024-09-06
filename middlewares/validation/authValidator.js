const { body, query } = require("express-validator");
const { validate } = require("../validate");
const User = require("../../models/User");

exports.signupValidator = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .toLowerCase()
        .custom(async (val) => {
            const user = await User.findOne({ username: val });
            if (user) {
                throw new Error("Username is already taken");
            }
        }),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .toLowerCase()
        .custom(async (val) => {
            const user = await User.findOne({ email: val });
            if (user) {
                throw new Error("Email is already in use");
            }
        }),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6, max: 26 })
        .withMessage("Password must be between 6 and 26 characters"),
    validate,
];

exports.loginValidator = [
    body("identifier")
        .trim()
        .notEmpty()
        .toLowerCase()
        .withMessage("Username or email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
];

exports.forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
        .toLowerCase()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
    validate,
];

exports.resetPasswordValidator = [
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6, max: 26 })
        .withMessage("Password must be between 6 and 26 characters"),
    query("token")
        .notEmpty()
        .withMessage("No token was provided")
        .isJWT()
        .withMessage("Invalid token"),
    validate,
];
