const express = require("express");

const reviewsRouter = require("#components/reviews/api/router");

const router = express.Router();

router.use("/:productId/reviews", reviewsRouter);

module.exports = router;
