const cartService = require("./service");
const { currencyFormatter } = require("#utils/formatter");

/**
 * @enum {string}
 */
const CategoryPath = {
  Laptops: "laptops",
  Phones: "phones",
};

exports.displayCart = async (req, res, next) => {
  let cartItems = [];
  try {
    if (!req.session.cartId) {
      req.session.cartId = await cartService.createCart(
        res.locals.isAuthenticated ? req.user.id : null,
      );
    } else {
      cartItems = await cartService.getCartItems(req.session.cartId);
    }
  } catch (err) {
    return next(err);
  }

  res.render("cart", {
    title: "Your cart",

    cartId: req.session.cartId,
    cartItems: cartItems,
    CategoryPath: CategoryPath,
  });
};
