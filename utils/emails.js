const nodemailer = require("nodemailer");
const ApiError = require("./error/ApiError");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
    },
});

/**
 * @desc    sending email to set a new password instead of the forgotten one
 */
exports.passwordResetEmail = async function (user, link) {
    const mailText =
        `Hello ${user.name},\n\n` +
        "You are receiving this email because you have requested to reset your password.\n\n" +
        `Please click on the following link, or paste this into your browser to complete the process: ${link} \n\n\n` +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n\n" +
        "ChatApp Team";

    try {
        await transporter.sendMail({
            from: "ChatApp",
            to: user.email,
            subject: "ChatApp Reset Password",
            text: mailText,
        });
    } catch (e) {
        throw new ApiError(500, "Resetting pasword email couldn't be sent");
    }
};
