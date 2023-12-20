// #TODO: User jsconfig file to add a path alias to src directory
const db = require("../../../db/client");
const { product_reviews, users } = require("../../../db/schema");
const { eq, sql, and } = require("drizzle-orm");

exports.getAllReviews = (productId) => {
  return db
    .select({
      userId: product_reviews.user_id,
      name: users.full_name,
      rating: product_reviews.rating,
      comment: product_reviews.comment,
      time: sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${product_reviews.created_at})`,
    })
    .from(product_reviews)
    .innerJoin(users, eq(users.id, product_reviews.user_id))
    .where(eq(product_reviews.product_id, productId));
};

exports.addReview = (productId, userId, rating, comment) => {
  return db.insert(product_reviews).values({
    product_id: productId,
    user_id: userId,
    rating,
    comment,
  });
};

exports.updateReview = (productId, userId, rating, comment) => {
  return db
    .update(product_reviews)
    .set({
      rating,
      comment,
    })
    .where(
      and(
        eq(product_reviews.product_id, productId),
        eq(product_reviews.user_id, userId),
      ),
    );
};

exports.deleteReview = (productId, userId) => {
  return db
    .delete(product_reviews)
    .where(
      and(
        eq(product_reviews.product_id, productId),
        eq(product_reviews.user_id, userId),
      ),
    );
};

const decimalPlaces = 1;
exports.calculateAvgRating = (reviews) => {
  const ratings = reviews.map((e) => e.rating);
  const sum = ratings.reduce((acc, e) => acc + e, 0);

  return Math.round((sum / ratings.length) * decimalPlaces) / decimalPlaces;
};
