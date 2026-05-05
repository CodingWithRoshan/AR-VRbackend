const express = require("express");

const router = express.Router();

const { upload } = require("../middlewares/multer.middleware");

const { uploadContentImage } = require("../controllers/upload.controller");


router.post("/upload", upload.single("file"), uploadContentImage);


module.exports = router;