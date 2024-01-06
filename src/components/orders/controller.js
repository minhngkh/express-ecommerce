const { param, validationResult, matchedData } = require("express-validator");
const createError = require("http-errors");

const ordersService = require("./service");

exports.renderOrderList = async (req, res, next) => {
  try {
    const orders = await ordersService.getOrders(req.user.id);

    res.render("orders/order-list", {
      title: "Orders",
      orders: orders,
      numEntries: orders.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.renderOrderDetails = [
  param("orderId").isInt({ min: 0 }).toInt(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError(400));

    const orderId = matchedData(req).orderId;

    try {
      const [order, items] = await Promise.all([
        ordersService.getOrderDetails(req.user.id, orderId),
        ordersService.getOrderItems(orderId),
      ]);

      if (!order) return next(createError(404));
      items.forEach((item) => (item.totalPrice = item.price * item.quantity));

      res.render("orders/order-details", {
        title: "Order details",
        order: order,
        items: items,
      });
    } catch (err) {
      next(err);
    }
  },
];
