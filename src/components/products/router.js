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

router.get("/test", (req, res) => {
  res.send(JSON.stringify(req.query));
});

module.exports = router;
