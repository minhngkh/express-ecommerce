const db = require("#db/client");
const { order, orderItem, product } = require("#db/schema");
const { eq, sql, desc, and } = require("drizzle-orm");

const RevenueRange = {
  _24h: 0,
  day: 1,
  month: 2,
  year: 3,
};

exports.getProductRevenue = async (range, top) => {
    let condition;
    
    switch (range) {
        case RevenueRange._24h:
            condition = sql`"order".created_at >= datetime('now', '-1 day')`;
            break;
        case RevenueRange.day:
            condition = sql`DATE("order".created_at) = DATE('now')`;
            break;
        case RevenueRange.month:
            condition = sql`strftime('%m %Y', "order".created_at) = strftime('%m %Y', 'now')`;
            break;
        case RevenueRange.year:
            condition = sql`strftime('%Y', "order".created_at) = strftime('%Y', 'now')`;
            break;
    }
    
    const query = db
        .select({
        name: product.name,
        total: sql`SUM(${orderItem.quantity} * ${orderItem.price})`,
        })
        .from(product)
        .innerJoin(orderItem, eq(product.id, orderItem.productId))
        .innerJoin(order, eq(orderItem.orderId, order.id))
        .where(and(eq(order.status, "paid"), condition))
        .groupBy(product.id)
        .limit(top);
    
    return query.then((val) => {
        return val;
    });
};

const MaxEntriesToDisplay = 12;
exports.getTotalRevenues = async (range) => {
    let groupBy;

    switch (range) {
        case RevenueRange.day:
            groupBy = sql`DATE(created_at)`;
            break;
        case RevenueRange.month:
            groupBy = sql`strftime('%m %Y', created_at)`;
            break;
        case RevenueRange.year:
            groupBy = sql`strftime('%Y', created_at)`;
            break;
        default:
            condition = "";
    }

    const query = db
        .select({
            name: groupBy,
            total: sql`SUM(${order.total})`,
        })
        .from(order)
        .where(eq(order.status, "paid"))
        .groupBy(groupBy)
        .limit(MaxEntriesToDisplay)
        .orderBy(desc(sql`DATE(created_at)`));


    return query.then((val) => {
        return val;
    });
};
