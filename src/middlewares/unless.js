module.exports = (path, middleware) => {
  return (req, res, next) => {
    if (path === req.baseUrl) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};
