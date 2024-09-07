const { body, param, query } = require("express-validator");
const { validate } = require("../validate");
const User = require("../../models/User");

exports.updateProfileValidator = [
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("email")
        .optional()
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
    body("username")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .custom(async (val) => {
            const user = await User.findOne({ username: val });
            if (user) {
                throw new Error("Username is already taken");
            }
        }),
    validate,
];

exports.getUserValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid user ID")
        .custom(async (val) => {
            const user = await User.findById(val);
            if (!user) {
                throw new Error("User not found");
            }
        }),
    validate,
];

exports.searchUsersValidator = [
    query("name").optional().trim().notEmpty().withMessage("Name is required"),
    query("username")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
    query("limit").optional().isInt().withMessage("Limit must be an integer"),
    query("page").optional().isInt().withMessage("Page must be an integer"),
    validate,
];
