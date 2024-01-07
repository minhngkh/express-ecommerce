const express = require("express");

const authenticated = require("#middlewares/authenticated");
const ordersController = require("./controller");

const router = express.Router();

router.use("/", authenticated.require);

router.get("/", ordersController.renderOrderList);

router.get("/:orderId", ordersController.renderOrderDetails);

module.exports = router;
