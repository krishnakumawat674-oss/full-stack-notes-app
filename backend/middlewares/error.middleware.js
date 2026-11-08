const errorMiddleware = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "token expired. please login again",
      success: false,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid Token",
      success: false,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
    });
  }

  

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  // 5. Custom Error Status
  const statusCode =
  Number.isInteger(err.statusCode) &&
  err.statusCode >= 400 &&
  err.statusCode <= 599
    ? err.statusCode
    : 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};

module.exports = errorMiddleware;
