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
    body("password")
        .optional()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6, max: 26 })
        .withMessage("Password must be between 6 and 26 characters"),
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
    query("name").trim().notEmpty().withMessage("Name is required"),
    query("limit").optional().isInt().withMessage("Limit must be an integer"),
    query("page").optional().isInt().withMessage("Page must be an integer"),
    validate,
];