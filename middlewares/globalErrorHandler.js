function sendErrorForDev(err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
}

function sendErrorForProd(err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
}

function globalErrorHandler(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = `${err.statusCode}`.startsWith("4") ? "fail" : "error";

    if (process.env.NODE_ENV === "production") {
        sendErrorForProd(err, res);
    } else {
        sendErrorForDev(err, res);
    }
}

module.exports = globalErrorHandler;
