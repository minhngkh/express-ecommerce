const createError = require("http-errors");

const cartService = require("#components/cart/service");
const userService = require("#components/user/service");

exports.renderCheckout = async (req, res, next) => {
  const { id: userId } = req.user;
  const { cartId } = req.session;

  if (!cartId) return next(createError(404));

  const items = await cartService.getCartItems(cartId);
  if (!items.length) return next(createError(404));

  items.forEach((item) => {
    item.totalPrice = item.price * item.quantity;
  });
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const address = await userService.getUserAddress(userId);

  const oneLineAddress = [
    ...(address.addressLine2 ? [address.addressLine2] : []),
    address.addressLine1,
    address.district,
    address.cityOrProvince,
  ].join(", ");

  res.render("checkout", {
    title: "Checkout",

    cartId: cartId,
    items: items,
    subtotal: subtotal,
    defaultAddress: {
      id: address.id,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address: oneLineAddress,
    },
  });
};
