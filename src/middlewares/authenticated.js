const createError = require("http-errors");
const userService = require("#components/user/service");
const cartService = require("#components/cart/service");

exports.require = (req, res, next) => {
  if (!res.locals.isAuthenticated) {
    return next(createError(401));
  }
  next();
};

exports.redirect = (destination = null) => {
  return (req, res, next) => {
    if (res.locals.isAuthenticated) {
      return res.redirect(destination || req.query.next || "/");
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

exports.updateCartInfoInSession = async (req, res, next) => {
  if (!res.locals.isAuthenticated) {
    return next();
  }
  if (Object.hasOwn(req.session, "cartId") && req.session.cartId !== null) {
    return next();
  }

  try {
    const cartId = await cartService.getCartOfUser(req.user.id);
    if (cartId !== null) {
      req.session.cartId = cartId;
      return next();
    }
    console.log("Create new cart");
    req.session.cartId = await cartService.createCart(req.user.id);
    return next();
  } catch (err) {
    return next(err);
  }
};
