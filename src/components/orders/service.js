const { and, desc, eq, sql } = require("drizzle-orm");

const db = require("#db/client");
const {
  order,
  orderItem,
  address,
  product,
  productCategory,
  productImage,
} = require("#db/schema");

const UtcTimeField = sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${order.createdAt})`;

/**
 * @typedef {object} Address
 * @property {string} fullName
 * @property {string} phoneNumber
 * @property {string} addressLine1
 * @property {string} [addressLine2]
 * @property {string} district
 * @property {string} cityOrProvince
 */

/**
 *
 * @param {number} userId
 * @param {{id: number, quantity: number, price: number}[]} items
 * @param {number} addressId
 * @param {Address} addressData
 * @returns
 */
exports.createOder = (userId, items, addressId, addressData) => {
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return db.transaction(async (tx) => {
    let newAddressId;
    if (addressId === null) {
      if (!addressData) {
        throw new Error("Address data is required");
      }

      const [{ id }] = await tx.insert(address).values(addressData).returning({
        id: address.id,
      });

      newAddressId = id;
    } else {
      newAddressId = addressId;
    }

    const [{ orderId }] = await tx
      .insert(order)
      .values({
        userId: userId,
        addressId: newAddressId,
        status: "pending",
        total: total,
      })
      .returning({
        orderId: order.id,
      });

    await Promise.all(
      items.map((item) => {
        return tx.insert(orderItem).values({
          orderId: orderId,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        });
      }),
    );

    return orderId;
  });
};

exports.getOrderDetails = (userId, orderId) => {
  const query = db
    .select({
      id: order.id,
      createdAt: UtcTimeField,
      status: order.status,
      total: order.total,
      address: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        district: address.district,
        cityOrProvince: address.cityOrProvince,
      },
    })
    .from(order)
    .innerJoin(address, eq(address.id, order.addressId))
    .where(and(eq(order.userId, userId), eq(order.id, orderId)))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};

exports.getOrderItems = (orderId) => {
  const query = db
    .select({
      productId: orderItem.productId,
      category: productCategory.name,
      name: product.name,
      price: orderItem.price,
      quantity: orderItem.quantity,
      image: productImage.source,
    })
    .from(orderItem)
    .innerJoin(product, eq(orderItem.productId, product.id))
    .innerJoin(productCategory, eq(productCategory.id, product.categoryId))
    .leftJoin(
      productImage,
      and(
        eq(productImage.productId, product.id),
        eq(productImage.isPrimary, true),
      ),
    )
    .where(eq(orderItem.orderId, orderId));

  return query;
};

exports.getOrders = (userId) => {
  const query = db
    .select({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      total: order.total,
    })
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt));

  return query;
};
