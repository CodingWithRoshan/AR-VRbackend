const fs = require("fs");
const cloudinary = require("../config/cloudinary");

function uploadWithRetry(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: "video",
        public_id: `birthday-recordings/${publicId}`,
        chunk_size: 6000000,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

function finalizeAndUpload({ sessionId, filePath, writeStream, bytesWrittenRef }) {
  return new Promise((resolve, reject) => {
    writeStream.end(async () => {
      if (bytesWrittenRef.value === 0) {
        console.log(`[${sessionId}] No data recorded, skipping upload`);
        fs.unlink(filePath, () => { });
        return resolve(null);
      }

      console.log(`[${sessionId}] File finalized (${bytesWrittenRef.value} bytes), uploading...`);

      try {
        const result = await uploadWithRetry(filePath, sessionId);
 
        console.dir(result, { depth: null }); fs.unlink(filePath, (err) => {
          if (err) console.error(`[${sessionId}] Failed to delete temp file:`, err);
        });
        resolve(result);
      } catch (err) {
        console.error(`[${sessionId}] Upload failed after retries. Full error:`, {
          message: err.message,
          http_code: err.http_code,
          error: err.error,
        });
        console.log(`[${sessionId}] File retained at: ${filePath} for manual inspection`);
        reject(err);
      }
    });
  });
}

module.exports = { finalizeAndUpload, uploadWithRetry };