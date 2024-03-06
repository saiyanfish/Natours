// module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);

module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    if (err.name === 'CastError') {
      [err.message, err.statusCode, err.isOperational] = [
        'ID not found',
        404,
        true,
      ];
      return next(err);
    }
    next(err);
  });
};
