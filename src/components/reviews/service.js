// #TODO: User jsconfig file to add a path alias to src directory
const db = require("../../db/client");
const { productReview, user } = require("../../db/schema");
const { eq, sql, and, avg } = require("drizzle-orm");

const utcTimeField = sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${productReview.createdAt})`;

exports.getAllReviews = (productId) => {
  return db
    .select({
      userId: productReview.userId,
      name: user.fullName,
      rating: productReview.rating,
      comment: productReview.comment,
      time: utcTimeField,
    })
    .from(productReview)
    .innerJoin(user, eq(user.id, productReview.userId))
    .where(eq(productReview.productId, productId));
};

exports.addReview = (productId, userId, rating, comment) => {
  const query = db
    .insert(productReview)
    .values({
      productId: productId,
      userId: userId,
      rating: rating,
      comment: comment,
    })
    .returning({
      time: utcTimeField,
    });

  return query.then((val) => val[0].time);
};

exports.updateReview = (productId, userId, rating, comment) => {
  const query = db
    .update(productReview)
    .set({
      rating,
      comment,
    })
    .where(
      and(
        eq(productReview.productId, productId),
        eq(productReview.userId, userId),
      ),
    )
    .returning({
      time: utcTimeField,
    });

  return query.then((val) => val[0].time);
};

exports.deleteReview = (productId, userId) => {
  return db
    .delete(productReview)
    .where(
      and(
        eq(productReview.productId, productId),
        eq(productReview.userId, userId),
      ),
    );
};

const decimalPlaces = 1;
exports.getAvgRating = (productId) => {
  const query = db
    .select({
      avgRating: avg(productReview.rating),
    })
    .from(productReview)
    .innerJoin(user, eq(user.id, productReview.userId))
    .where(eq(productReview.productId, productId));

  return query.then((val) => {
    const { avgRating } = val[0];
    return avgRating === null
      ? null
      : +parseFloat(avgRating).toFixed(decimalPlaces);
  });
};
