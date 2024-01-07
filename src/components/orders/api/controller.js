const {
  body,
  validationResult,
  matchedData,
  oneOf,
} = require("express-validator");

const cartService = require("#components/cart/service");
const productsService = require("#components/products/service");
const ordersService = require("#components/orders/service");

exports.createOrder = [
  [
    oneOf([
      [
        body("addressSelection").equals("default"),
        body("addressId").notEmpty().isInt({ min: 0 }),
      ],
      [
        body("addressSelection").equals("new"),
        body("address")
          .notEmpty()
          .isObject()
          .custom((val) => {
            if (
              !val.fullName ||
              !val.phoneNumber ||
              !val.addressLine1 ||
              !val.district ||
              !val.cityOrProvince
            ) {
              return false;
            }

            if (val.phoneNumber.length !== 10) {
              return false;
            }

            return true;
          }),
      ],
    ]),
    body("items")
      .notEmpty()
      .isArray({ min: 1 })
      .custom((val) => {
        return val.every((item) => {
          return (
            Number.isInteger(item.id) &&
            item.id >= 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            Number.isInteger(item.price) &&
            item.price >= 0
          );
        });
      }),
  ],

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({
        error: {
          message: "Invalid order data",
          type: "danger",
        },
      });
    }

    const userId = req.user.id;
    const data = matchedData(req);

    try {
      const prices = await productsService.getPrices(
        data.items.map((i) => i.id),
      );

      if (!data.items.every((item) => item.price == prices[item.id])) {
        return res.status(409).send({
          prices: prices,
          error: {
            message: "Product prices have changed",
            type: "danger",
          },
        });
      }

      const orderId = await ordersService.createOder(
        userId,
        data.items,
        data.addressId ? data.addressId : null,
        data.address ? data.address : null,
      );

      await cartService.deleteItemsFromCart(
        req.session.cartId,
        data.items.map((i) => i.id),
      );
      delete req.session.cartId;

      return res.status(200).send({
        orderId: orderId,
      });
    } catch (err) {
      console.log(err);
      return res.status(409).send({
        error: {
          message: "There is something wrong",
          type: "danger",
        },
      });
    }
  },
];
