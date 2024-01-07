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
    let condition;
    let groupBy;

    switch (range) {
        case RevenueRange.day:
            condition = sql`DATE("order".created_at) >= DATE('now', '-12 day')`;
            groupBy = sql`DATE(created_at)`;
            break;
        case RevenueRange.month:
            // condition = sql`strftime('%m %Y', "order".created_at) >= strftime('%m %Y', 'now', '-12 month')`;
            condition = sql`DATE("order".created_at, 'start of month') >= DATE('now', 'start of month', '-12 month')`;
            groupBy = sql`strftime('%m %Y', created_at)`;
            break;
        case RevenueRange.year:
            condition = sql`strftime('%Y', "order".created_at) >= strftime('%Y', 'now', '-12 year')`;
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
        .where(and(eq(order.status, "paid"), condition))
        .groupBy(groupBy)
        .limit(MaxEntriesToDisplay)
        .orderBy(desc(sql`DATE(created_at)`));


    return query.then((val) => {
        switch (range) {
            case RevenueRange.day:
                for (let i = 0; i < val.length; i++) {
                    val[i].name = new Date(val[i].name).toLocaleDateString();
                }        
        
                if (val.length < MaxEntriesToDisplay) {
                    const missing = MaxEntriesToDisplay - val.length;
        
                    const currentDate = new Date();
                    for (let i = 0; i < missing; i++) {
                        const date = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            currentDate.getDate() - i
                        );
                        if (val.find((v) => v.name === date.toLocaleDateString()) === undefined) {
                            val.push({ name: date.toLocaleDateString(), total: 0 });
                        }
                    }
                }
                
                val.sort((a, b) => new Date(a.name) - new Date(b.name));
                break;
            case RevenueRange.month:
                for (let i = 0; i < val.length; i++) {
                    const dateParts = val[i].name.split(' ');
                    const date = new Date(dateParts[1], dateParts[0] - 1);
                
                    val[i].name = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
                }
        
                if (val.length < MaxEntriesToDisplay) {
                    const missing = MaxEntriesToDisplay - val.length;
        
                    const currentDate = new Date();
                    for (let i = 0; i < missing; i++) {
                        const date = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth() - i,
                            1
                        );
                        if (
                            val.find(
                                (v) =>
                                    v.name ===
                                    `${date.toLocaleString("default", {
                                        month: "short",
                                    })} ${date.getFullYear()}`
                            ) === undefined
                        ) {
                            val.push({
                                name: `${date.toLocaleString("default", {
                                    month: "short",
                                })} ${date.getFullYear()}`,
                                total: 0,
                            });
                        }
                    }
                }
        
                val.sort((a, b) => {
                    const aDate = new Date(a.name);
                    const bDate = new Date(b.name);
                    return aDate - bDate;
                });
                break;
            case RevenueRange.year:
                for (let i = 0; i < val.length; i++) {
                    val[i].name = new Date(val[i].name).getFullYear();
                }
        
                if (val.length < MaxEntriesToDisplay) {
                    const missing = MaxEntriesToDisplay - val.length;
        
                    const currentDate = new Date();
                    for (let i = 0; i < missing; i++) {
                        const date = new Date(currentDate.getFullYear() - i, 0, 1);
                        if (val.find((v) => v.name === date.getFullYear()) === undefined) {
                            val.push({ name: date.getFullYear(), total: 0 });
                        }
                    }
                }
        
                val.sort((a, b) => a.name - b.name);
                break;
        }
        return val;
    });
};
