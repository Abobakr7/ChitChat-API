const { param, query } = require("express-validator");
const { validate } = require("../validate");

exports.idValidator = [
    param("id").isMongoId().withMessage("Invalid id"),
    validate,
];

exports.getFriendValidator = [
    query("limit").optional().isInt().withMessage("Limit must be an integer"),
    query("page").optional().isInt().withMessage("Page must be an integer"),
    validate,
];
