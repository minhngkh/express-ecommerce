const cartService = require("./service");

/**
 * @enum {string}
 */
const CategoryPath = {
  Laptops: "laptops",
  Phones: "phones",
};

// TODO: no longer need to create cart for authenticated users
exports.displayCart = async (req, res, next) => {
  let cartItems = [];

  try {
    if (req.session.cartId) {
      cartItems = await cartService.getCartItems(req.session.cartId);
    } else {
      req.session.cartId = await cartService.createCart();
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
