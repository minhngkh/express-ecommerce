const express = require("express");
const reviewsController = require("./controller");

const router = express.Router({ mergeParams: true });

router.get("/", reviewsController.getAllReviews);

router.put("/", reviewsController.updateReview);

router.post("/", reviewsController.addReview);

router.delete("/:userId", reviewsController.deleteReview);

module.exports = router;
