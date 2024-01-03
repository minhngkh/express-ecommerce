const express = require("express");

const cartController = require("./controller");

const router = express.Router();

router.get("/", cartController.displayCart);

module.exports = router;
