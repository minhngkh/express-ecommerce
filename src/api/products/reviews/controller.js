const reviewsService = require("../../../components/products/reviews/service");

exports.getAllReviewsOfpProduct = async (req, res, _) => {
  const reviews = await reviewsService.getAllReviews(req.params.productId);

  res.json(reviews);
};
