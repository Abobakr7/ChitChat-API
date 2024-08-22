const multer = require("multer");
const ApiError = require("./error/ApiError");

module.exports = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        if (ext !== "jpeg" && ext !== "jpg" && ext !== "png") {
            return cb(
                new ApiError(400, "Only images jpeg/jpg/png are allowed"),
                false
            );
        }
        cb(null, true);
    },
});
