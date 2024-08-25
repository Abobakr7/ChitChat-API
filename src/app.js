require("./database/database");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const express = require("express");

const ApiError = require("../utils/error/ApiError");
const globalErrorHandler = require("../middlewares/globalErrorHandler");
const userAuthRoute = require("../routes/userAuthRoute");
const userRoute = require("../routes/userRoute");

const app = express();

// middleware
if (process.env.NODE_ENV === "development") {
    console.log("Development Mode");
    app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/v1/auth", userAuthRoute);
app.use("/api/v1/users", userRoute);

app.all("*", (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.method} ${req.originalUrl}`));
});

// global error handler
app.use(globalErrorHandler);

// web sockets

module.exports = app;
