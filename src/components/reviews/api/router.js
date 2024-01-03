const express = require("express");

const reviewsApiController = require("./controller");

const router = express.Router({ mergeParams: true });

router.get("/", reviewsApiController.getAllReviews);

router.post(
  "/",
  reviewsApiController.validateReview,
  reviewsApiController.addReview,
);

router.put(
  "/:userId",
  reviewsApiController.validateReview,
  reviewsApiController.updateReview,
);

router.delete("/:userId", reviewsApiController.deleteReview);

module.exports = router;
