const { and, eq, sql, getTableColumns } = require("drizzle-orm");

const db = require("#db/client");
const {
  cart,
  cartItem,
  product,
  productImage,
  productCategory,
} = require("#db/schema");

exports.createCart = async (userId = null) => {
  const query = db
    .insert(cart)
    .values(userId ? { userId: userId } : {})
    .returning({
      insertedId: cart.id,
    });

  return query.then((val) => val[0].insertedId);
};

exports.addItemToCart = async (cartId, productId, quantity) => {
  const query = db
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
    });

  return query;
};

exports.getCartItems = async (cartId) => {
  const query = db
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

  return query;
};

exports.updateItemInCart = async (cartId, productId, quantity) => {
  return db
    .update(cartItem)
    .set({
      quantity: quantity,
    })
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)));
};

exports.removeItemFromCart = async (cartId, productId) => {
  return db
    .delete(cartItem)
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)));
};
