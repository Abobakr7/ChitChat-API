const { body, query } = require("express-validator");
const { validate } = require("../validate");
const User = require("../../models/User");

exports.signupValidator = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
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
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
];

exports.forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
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
