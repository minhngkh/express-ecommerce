const express = require("express");

const cartApiController = require("./controller");

const router = express.Router();

router.post("/", cartApiController.addItemToCart);

router.patch("/", cartApiController.updateItemInCart);

router.delete("/", cartApiController.removeItemFromCart);

module.exports = router;
