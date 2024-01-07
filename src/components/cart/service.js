const { and, desc, eq, isNull, sql } = require("drizzle-orm");

const db = require("#db/client");
const {
  cart,
  cartItem,
  product,
  productImage,
  productCategory,
} = require("#db/schema");

const NewExpiration = sql`datetime('now', '+7 day')`;

/**
 * Create a new cart
 * @param {number} userId
 * @returns Cart id
 */
exports.createCart = (userId = null) => {
  const toInsertFields =
    userId === null
      ? { expiration: NewExpiration }
      : { userId: userId, expiration: null };

  const query = db.insert(cart).values(toInsertFields).returning({
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
  return db
    .insert(cartItem)
    .values({
      cartId: cartId,
      productId: productId,
      quantity: quantity,
      updatedAt: sql`current_timestamp`,
    })
    .onConflictDoUpdate({
      target: [cartItem.cartId, cartItem.productId],
      set: {
        quantity: sql`${cartItem.quantity} + ${quantity}`,
      },
    });
};

/**
 * Get items in the cart
 * @param {number} cartId
 * @returns Items in the cart
 */
exports.getCartItems = (cartId, onlyAvailable = false) => {
  const getItems = db
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
    .where(
      and(
        eq(cartItem.cartId, cartId),
        ...(onlyAvailable ? [eq(product.status, "on stock")] : []),
      ),
    )
    .orderBy(desc(cartItem.updatedAt));

  const renewExpiration = db
    .update(cart)
    .set({
      expiration: NewExpiration,
    })
    .where(and(eq(cart.id, cartId), isNull(cart.userId)));

  return db.batch([getItems, renewExpiration]).then((val) => val[0]);
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
      updatedAt: sql`current_timestamp`,
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

/**
 * Merge items from one cart to another
 * @param {number} fromCartId
 * @param {number} toCartId
 * @returns
 */
exports.mergeCart = (fromCartId, toCartId) => {
  // Getting cart items to merge in sub-query
  const sq = db
    .select({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
    })
    .from(cartItem)
    .where(eq(cartItem.cartId, fromCartId))
    .as("sq");

  const mergeQuery = db.run(sql`
    INSERT INTO ${cartItem} (
      ${name(cartItem.cartId)}, 
      ${name(cartItem.productId)}, 
      ${name(cartItem.quantity)})
    SELECT ${toCartId}, ${sq.productId}, ${sq.quantity} FROM ${sq} WHERE true
    ON CONFLICT (${cartItem.cartId}, ${cartItem.productId})
    DO UPDATE SET
      ${name(cartItem.quantity)} = 
        ${name(cartItem.quantity)} + excluded.${name(cartItem.quantity)},
      ${name(cartItem.updatedAt)} = current_timestamp
  `);

  const removeQuery = db
    .update(cart)
    .set({
      expiration: sql`current_timestamp`,
    })
    .where(eq(cart.id, fromCartId));

  return db.batch([mergeQuery, removeQuery]);
};

/**
 * Get cart of the user
 * @param {number} userId
 * @returns Cart id
 */
exports.getCartOfUser = (userId) => {
  const query = db
    .select({
      id: cart.id,
      expiration: cart.expiration,
    })
    .from(cart)
    .where(and(eq(cart.userId, userId), isNull(cart.expiration)))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0].id : null;
  });
};

exports.deleteCart = (cartId) => {
  return db
    .update(cart)
    .set({ expiration: sql`current_timestamp` })
    .where(eq(cart.id, cartId));
};

/**
 *
 * @param {number} cartId
 * @param {number[]} productIds
 * @returns
 */
exports.deleteItemsFromCart = (cartId, productIds) => {
  return db
    .delete(cartItem)
    .where(
      and(
        eq(cartItem.cartId, cartId),
        ...productIds.map((id) => eq(cartItem.productId, id)),
      ),
    );
};

// Helpers

const name = (col) => {
  return sql.raw(col.name);
};
