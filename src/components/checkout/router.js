const express = require("express");

const authenticated = require("#middlewares/authenticated");
const checkoutController = require("./controller");

const router = express.Router();

router.use("/", authenticated.require);

router.get("/", checkoutController.renderCheckout);

module.exports = router;
