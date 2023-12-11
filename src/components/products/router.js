const express = require("express");
const router = express.Router();
const productsController = require("./controller");

router.get("/:category", productsController.renderProductsList);

router.get("/:category/:id", productsController.renderProductDetail);

router.post(
  "/add-review",
  productsController.validateReview,
  productsController.addReview,
);

module.exports = router;
