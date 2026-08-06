module.exports = (err, req, res, next) => {
  req.log.error(err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message,
  });
};