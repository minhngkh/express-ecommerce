const express = require("express");
const router = express.Router();
const productsController = require("./controller");

router.get("/:type", productsController.renderProductsList);

module.exports = router;
