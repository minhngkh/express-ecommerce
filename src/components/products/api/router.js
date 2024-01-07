const express = require("express");

const reviewsRouter = require("#components/reviews/api/router");
const productsApiController = require("./controller");

const router = express.Router();

router.use("/:productId/reviews", reviewsRouter);

router.get("/:category", productsApiController.getProductList);

module.exports = router;
