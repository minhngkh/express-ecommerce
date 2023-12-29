const reviewsService = require("../service");
const { body, validationResult } = require("express-validator");

exports.getAllReviews = async (req, res, _) => {
  const reviews = await reviewsService.getAllReviews(req.params.productId);

  res.json(reviews);
};

exports.validateReview = [
  body("userId").notEmpty().isInt(),
  body("rating").notEmpty().isInt({ min: 1, max: 5 }),
  body("comment").notEmpty().trim().isLength({ min: 1, max: 1000 }),
];

exports.addReview = async (req, res, _) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).end();
  }

  const { productId } = req.params;
  const { userId, rating, comment } = req.body;

  try {
    const time = await reviewsService.addReview(
      Number(productId),
      Number(userId),
      Number(rating),
      comment,
    );

    const newAvgRating = await reviewsService.getAvgRating(productId);

    res.status(200).json({
      time: time,
      newAvgRating: newAvgRating,
    });
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
};

exports.updateReview = async (req, res, _) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).end();
  }

  const { productId, userId } = req.params;
  const { rating, comment } = req.body;

  console.log("rating, comment", rating, comment);
  try {
    const time = await reviewsService.updateReview(
      productId,
      userId,
      Number(rating),
      comment,
    );

    const newAvgRating = await reviewsService.getAvgRating(productId);

    res.status(200).json({
      time: time,
      newAvgRating: newAvgRating,
    });
  } catch (err) {
    res.status(400).end();
  }
};

exports.deleteReview = async (req, res, _) => {
  const { productId, userId } = req.params;

  try {
    await reviewsService.deleteReview(productId, userId);

    const newAvgRating = await reviewsService.getAvgRating(productId);

    res.status(200).json({
      newAvgRating: newAvgRating,
    });
  } catch (err) {
    res.status(400).end();
  }
};
