const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicatedFieldsError = (err) => {
  console.log(err);
  // const value = err.message.match(/(["'"])(\\?.)*?\1/);
  const value = JSON.stringify(err.keyValue).match(/"([^"]*)"\s*:\s*"([^"]*)"/);

  return new AppError(`Duplicated ${value[1]} : ${value[2]}`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input value. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again !!', 401);

const handleJWTExpired = () =>
  new AppError('Token has expired. Please login again !!', 401);
const sendErrorDev = (err, req, res) => {
  // api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something wnet wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something wnet wrong',
        msg: err.message,
      });
    }
    // rendered website
    return res.status(err.statusCode).render('error', {
      title: 'Something wnet wrong',
      msg: 'Please try again later',
    });
  }
  // API
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicatedFieldsError(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpired(error);
    sendErrorProd(error, req, res);
  }
};
