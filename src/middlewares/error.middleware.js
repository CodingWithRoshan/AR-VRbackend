// If you already have this file in your project, keep your version —
// this is only here so the file set below runs standalone.
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal server error",
    },
  });
}

module.exports = { errorHandler };