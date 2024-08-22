const sharp = require("sharp");

exports.imageProcess = async (req, res, next) => {
    if (!req.file) return next();

    const imgExt = req.file.mimetype.split("/")[1];
    req.file.filename = `avatar-${Date.now()}.${imgExt}`;
    const imgPath = `public/avatars/${req.file.filename}`;
    await sharp(req.file.buffer).toFormat(imgExt).toFile(imgPath);
    req.body.avatar = imgPath;
    next();
};
