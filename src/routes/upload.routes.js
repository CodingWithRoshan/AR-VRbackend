const express = require("express");
const multer = require("multer");
const { handleUploadChunk, handleEndSession } = require("../controllers/recording.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per chunk
});

router.post("/upload-chunk", upload.single("chunk"), handleUploadChunk);
router.post("/end-session", handleEndSession); // note: no multer/upload middleware here

module.exports = router;