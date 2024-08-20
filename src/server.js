const app = require("./app");

const PORT = process.env.PORT || 3030;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT RECEIVED. Shutting down...");
    server.close(() => {
        process.exit(0);
    });
});
