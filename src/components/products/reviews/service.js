// #TODO: User jsconfig file to add a path alias to src directory
const db = require("../../../db/client");
const { product_reviews } = require("../../../db/schema");
const { eq } = require("drizzle-orm");

exports.getAllReviews = (productId) => {
  return db
    .select()
    .from(product_reviews)
    .where(eq(product_reviews.product_id, productId));
};
