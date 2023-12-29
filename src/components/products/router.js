const express = require("express");

const productsController = require("./controller");

const router = express.Router();

router.get("/:category", productsController.renderProductList);

router.get("/:category/:id", productsController.renderProductDetail);

module.exports = router;
