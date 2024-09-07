const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");

exports.auth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        throw new ApiError(403, "Please authenticate");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            throw new ApiError(401, "Invalid token");
        }
        return jwt.decode(token);
    });
    const user = await User.findById(decoded._id);
    if (!user) {
        throw new ApiError(401, "Please authenticate");
    }
    req.user = user;
    next();
});
