const { and, eq, sql } = require("drizzle-orm");

const db = require("#db/client");
const {
  cart,
  cartItem,
  product,
  productImage,
  productCategory,
} = require("#db/schema");

/**
 * Create a new cart
 * @param {number} userId
 * @returns Cart id
 */
exports.createCart = (userId = null) => {
  const query = db
    .insert(cart)
    .values(userId ? { userId: userId } : {})
    .returning({
      insertedId: cart.id,
    });

  return query.then((val) => val[0].insertedId);
};

/**
 * Add a new item to the cart or increase the quantity if the item already
 * exists
 * @param {number} cartId
 * @param {number} productId
 * @param {number} quantity
 * @returns
 */
exports.addItemToCart = (cartId, productId, quantity) => {
  return db.batch([
    db
      .insert(cartItem)
      .values({
        cartId: cartId,
        productId: productId,
        quantity: quantity,
      })
      .onConflictDoUpdate({
        target: [cartItem.cartId, cartItem.productId],
        set: {
          quantity: sql`${cartItem.quantity} + ${quantity}`,
        },
      }),

    db.update(cart).set({
      expiration: sql,
    }),
  ]);
};

/**
 * Get items in the cart
 * @param {number} cartId
 * @returns Items in the cart
 */
exports.getCartItems = (cartId) => {
  return db
    .select({
      productId: cartItem.productId,
      category: productCategory.name,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: productImage.source,
      status: product.status,
    })
    .from(cartItem)
    .innerJoin(product, eq(cartItem.productId, product.id))
    .innerJoin(productCategory, eq(productCategory.id, product.categoryId))
    .leftJoin(
      productImage,
      and(
        eq(productImage.productId, product.id),
        eq(productImage.isPrimary, true),
      ),
    )
    .where(eq(cartItem.cartId, cartId));
};

/**
 * Update item quantity in the cart
 * @param {number} cartId
 * @param {number} productId
 * @param {number} quantity
 * @returns
 */
exports.updateItemInCart = (cartId, productId, quantity) => {
  return db
    .update(cartItem)
    .set({
      quantity: quantity,
    })
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)));
};

/**
 * Remove item from the cart
 * @param {number} cartId
 * @param {number} productId
 * @returns
 */
exports.removeItemFromCart = (cartId, productId) => {
  return db
    .delete(cartItem)
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)));
};

/**
 * Bind cart to user
 * @param {number} cartId
 * @param {number} userId
 * @returns
 */
exports.bindCartToUser = (cartId, userId) => {
  return db
    .update(cart)
    .set({
      userId: userId,
      expiration: null,
    })
    .where(eq(cart.id, cartId));
};
