const express = require("express");

const ordersApiController = require("./controller");

const router = express.Router();

router.post("/", ordersApiController.createOrder);

module.exports = router;
