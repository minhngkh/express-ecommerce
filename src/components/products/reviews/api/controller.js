const reviewsService = require("../service");

exports.getAllReviews = async (req, res, _) => {
  const reviews = await reviewsService.getAllReviews(req.params.productId);

  res.json(reviews);
};

exports.updateReview = async (req, res, _) => {
  const { productId } = req.params;
  const { userId, rating, comment } = req.body;

  console.log("rating, comment", rating, comment);
  try {
    await reviewsService.updateReview(productId, userId, rating, comment);

    res.status(200).send();
  } catch (err) {
    res.status(400).send();
  }
};

exports.addReview = async (req, res, _) => {
  const { productId } = req.params;
  const { userId, rating, comment } = req.body;

  console.log("rating, comment", rating, comment);
  try {
    await reviewsService.addReview(productId, userId, rating, comment);

    res.status(200).send();
  } catch (err) {
    res.status(400).send();
  }
};

exports.deleteReview = async (req, res, _) => {
  const { productId, userId } = req.params;

  try {
    await reviewsService.deleteReview(productId, userId);

    res.status(200).send();
  } catch (err) {
    res.status(400).send();
  }
};
