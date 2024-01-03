const cartService = require("../service");

exports.addItemToCart = async (req, res, _) => {
  let { cartId } = req.session;
  if (!cartId) {
    if (res.locals.isAuthenticated) {
      cartId = await cartService.getCartOfUser(req.user.id);
      if (cartId === null) {
        cartId = await cartService.createCart(req.user.id);
      }
    } else {
      cartId = await cartService.createCart();
    }

    req.session.cartId = cartId;
  }

  const productId = Number(req.body.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).end();
  }
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).end();
  }

  try {
    await cartService.addItemToCart(cartId, productId, quantity);

    res.status(200).end();
  } catch (err) {
    res.status(400).end();
  }
};

exports.updateItemInCart = async (req, res, _) => {
  const { cartId } = req.session;
  if (!cartId) {
    return res.status(400).end();
  }

  const productId = Number(req.body.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).end();
  }
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).end();
  }

  try {
    await cartService.updateItemInCart(cartId, productId, quantity);

    res.status(200).end();
  } catch (err) {
    res.status(400).end();
  }
};

exports.removeItemFromCart = async (req, res, _) => {
  const { cartId } = req.session;
  if (!cartId) {
    return res.status(400).end();
  }

  const productId = Number(req.body.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).end();
  }

  try {
    await cartService.removeItemFromCart(cartId, productId);

    res.status(200).end();
  } catch (err) {
    res.status(400).end();
  }
};
