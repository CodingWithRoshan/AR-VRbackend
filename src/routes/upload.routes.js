const express = require("express");

const router = express.Router();


const { uploadContentImage } = require("../controllers/upload.controller");


router.post(

    "/upload",
    uploadContentImage

);


module.exports = router;