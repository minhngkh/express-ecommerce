const express = require("express");
const reviewsController = require("./controller");

const router = express.Router({ mergeParams: true });

router.get("/", reviewsController.getAllReviewsOfpProduct);

module.exports = router;
