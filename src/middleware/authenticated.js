const createError = require("http-errors");

exports.require = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(createError(401));
  }
  next();
};

exports.redirect = (destination) => {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect(destination);
    }
    next();
  };
};
