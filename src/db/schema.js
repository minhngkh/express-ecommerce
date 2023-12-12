const {
  sqliteTable,
  text,
  integer,
  primaryKey,
} = require("drizzle-orm/sqlite-core");
const { sql } = require("drizzle-orm");

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  full_name: text("full_name"),
  avatar: text("avatar"),
  created_at: text("created_at").default(sql`current_timestamp`),
});

const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  image: text("image").notNull(),
});

const laptop_products = sqliteTable("laptop_products", {
  id: integer("id")
    .primaryKey()
    .references(() => products.id),
  subcategory: text("subcategory"),
  cpu: text("cpu"),
  resolution: text("resolution"),
  ram: text("ram"),
  storage: text("storage"),
});

const product_reviews = sqliteTable(
  "product_reviews",
  {
    product_id: integer("product_id").references(() => products.id),
    user_id: integer("user_id").references(() => users.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    created_at: text("created_at").default(sql`current_timestamp`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.product_id, table.user_id] }),
    };
  },
);

const temp_product_reviews = sqliteTable("temp_product_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  product_id: integer("product_id")
    .notNull()
    .references(() => products.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: text("date").default(sql`current_date`),
});

module.exports = {
  users,
  products,
  laptop_products,
  product_reviews,
  temp_product_reviews,
};
