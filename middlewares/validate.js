const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
    let errors = validationResult(req).array();
    if (errors.length !== 0) {
        errors = errors.map((e) => e.msg);
        return res.status(400).json({ status: "fail", error: errors });
    }
    next();
};
