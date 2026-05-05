const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Temp directory
const tempDir = path.join(process.cwd(), "temp", "content");

// Ensure temp folder exists asynchronously at server start
(async () => {
    try {
        await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
        console.error("Failed to create temp folder:", err);
        process.exit(1);
    }
})();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images, PDF, and Word files are allowed"));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

module.exports = { upload, tempDir };
