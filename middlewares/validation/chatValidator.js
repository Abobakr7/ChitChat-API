const { body, param } = require("express-validator");
const { validate } = require("../validate");

exports.idValidator = [
    param("id").isMongoId().withMessage("Invalid ID"),
    validate,
];

exports.createConvoValidator = [
    body("recieverId").isMongoId().withMessage("Invalid ID"),
    validate,
];

exports.getMessagesValidator = [
    param("convoId").isMongoId().withMessage("Invalid ID"),
    validate,
];

exports.sendMessageValidator = [
    body("content").isString().withMessage("Content is required"),
    body("conversationId").isMongoId().withMessage("Invalid ID"),
    validate,
];
