exports.redirect = (destination) => {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect(destination);
    }
    next();
  };
};
