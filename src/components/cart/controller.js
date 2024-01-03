const cartService = require("./service");

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
    if (req.session.cartId) {
      cartItems = await cartService.getCartItems(req.session.cartId);
    } else if (res.locals.isAuthenticated) {
      let cartId = await cartService.getCartOfUser(req.user.id);
      if (cartId !== null) {
        cartItems = await cartService.getCartItems(cartId);
      } else {
        cartId = await cartService.createCart(req.user.id);
      }

      req.session.cartId = cartId;
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
