const express = require("express");
const reviewsRouter = require("./reviews/router");

const router = express.Router();

router.use("/:productId/reviews", reviewsRouter);

module.exports = router;
