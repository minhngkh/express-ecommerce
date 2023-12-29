const express = require("express");
const reviewsRouter = require("../../reviews/api/router");

const router = express.Router();

router.use("/:productId/reviews", reviewsRouter);

module.exports = router;
