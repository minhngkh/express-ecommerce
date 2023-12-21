const createError = require("http-errors");
const userService = require("../components/user/service");

exports.require = (req, res, next) => {
  if (!res.locals.isAuthenticated) {
    return next(createError(401));
  }
  next();
};

exports.redirect = (destination) => {
  return (req, res, next) => {
    if (res.locals.isAuthenticated) {
      return res.redirect(destination);
    }
    next();
  };
};

/**
 *
 * @param {*} fields Array of fields contains: "id", "email", "avatar",
 * "fullName", or "createdAt"
 * @returns
 */
exports.updateUserInfoInSession = (fields) => {
  return async (req, res, next) => {
    if (!res.locals.isAuthenticated) {
      return next();
    }

    try {
      const toGet = req.session.userInfo
        ? fields.filter((e) => !Object.hasOwn(req.session.userInfo, e))
        : fields;
      const info = await userService.getUserInfo(req.user.id, toGet);

      req.session.userInfo = Object.assign(req.session.userInfo || {}, info);

      return next();
    } catch (err) {
      return next(err);
    }
  };
};
