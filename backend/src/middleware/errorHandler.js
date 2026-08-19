module.exports = (err, req, res, next) => {
  req.log.error(err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message,
  });
};
