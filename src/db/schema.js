const { eq, sql } = require("drizzle-orm");
const {
  integer,
  foreignKey,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} = require("drizzle-orm/sqlite-core");

const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatar: text("avatar"),
  addressId: integer("address_id").references(() => address.id),
  createdAt: text("created_at").default(sql`current_timestamp`),

  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  token: text("token"),
  tokenExpiration: text("token_expiration"),

  isBanned: integer("is_banned", { mode: "boolean" }).default(false),
});

const admin = sqliteTable("admin", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: text("created_at").default(sql`current_timestamp`),
});

const productCategory = sqliteTable("product_category", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

const productSubcategory = sqliteTable(
  "product_subcategory",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryId: integer("category_id").references(() => productCategory.id),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => {
    return {
      idCategoryIdUnique: uniqueIndex(
        "ux__product_subcategory__id__category_id",
      ).on(table.id, table.categoryId),
    };
  },
);

const productBrand = sqliteTable("product_brand", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

const brandInCategory = sqliteTable(
  "brand_in_category",
  {
    categoryId: integer("category_id").references(() => productCategory.id),
    brandId: integer("brand_id").references(() => productBrand.id, {
      onDelete: "cascade",
    }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.categoryId, table.brandId] }),
    };
  },
);

const product = sqliteTable(
  "product",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryId: integer("category_id").references(() => productCategory.id),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    brandId: integer("brand_id"),
    subcategoryId: integer("subcategory_id"),
    status: text("status").notNull(),
    createdAt: text("created_at").default(sql`current_timestamp`),
    isDeleted: integer("is_deleted", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => {
    return {
      brandInCategoryRef: foreignKey({
        columns: [table.categoryId, table.brandId],
        foreignColumns: [brandInCategory.categoryId, brandInCategory.brandId],
      }),
      subcategoryRef: foreignKey({
        columns: [table.subcategoryId, table.categoryId],
        foreignColumns: [productSubcategory.id, productSubcategory.categoryId],
      }),
      idCategoryIdUnique: uniqueIndex("ux__product__id__category_id").on(
        table.id,
        table.categoryId,
      ),
    };
  },
);

const laptopProduct = sqliteTable(
  "laptop_product",
  {
    productId: integer("product_id").primaryKey(),
    categoryId: integer("category_id"), // Check = 0
    screenSize: text("screen_size"),
    resolution: text("resolution"),
    cpu: text("cpu"),
    gpu: text("gpu"),
    ram: text("ram"),
    storage: text("storage"),
    ports: text("ports"),
  },
  (table) => {
    return {
      productReference: foreignKey({
        columns: [table.productId, table.categoryId],
        foreignColumns: [product.id, product.categoryId],
      }).onDelete("cascade"),
    };
  },
);

const phoneProduct = sqliteTable(
  "phone_product",
  {
    productId: integer("product_id").primaryKey(),
    categoryId: integer("category_id"), // Check = 1
    screenSize: text("screen_size"),
    resolution: text("resolution"),
    frontCamera: text("front_camera"),
    rearCamera: text("rear_camera"),
    battery: text("battery"),
    chip: text("chip"),
    ram: text("ram"),
    storage: text("storage"),
  },
  (table) => {
    return {
      productReference: foreignKey({
        columns: [table.productId, table.categoryId],
        foreignColumns: [product.id, product.categoryId],
      }).onDelete("cascade"),
    };
  },
);

const productImage = sqliteTable(
  "product_image",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").references(() => product.id),
    source: text("source").notNull(),
    isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
  },
  (table) => {
    return {
      productIdIsPrimaryUnique: uniqueIndex(
        "ux__product_image__product_id__is_primary",
      )
        .on(table.productId, table.isPrimary)
        .where(eq(table.isPrimary, true)),
    };
  },
);

const productReview = sqliteTable(
  "product_review",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").references(() => product.id),
    userId: integer("user_id").references(() => user.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: text("created_at").default(sql`current_timestamp`),
  },
  (table) => {
    return {
      productIdUserIdUnique: uniqueIndex(
        "ux__product_review__product_id__user_id",
      ).on(table.productId, table.userId),
    };
  },
);

const cart = sqliteTable("cart", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => user.id),
  expiration: text("expiration"),
});

const cartItem = sqliteTable(
  "cart_item",
  {
    cartId: integer("cart_id").references(() => cart.id),
    productId: integer("product_id").references(() => product.id),
    quantity: integer("quantity").notNull(),
    updatedAt: text("updated_at").default(sql`current_timestamp`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.cartId, table.productId] }),
    };
  },
);

const address = sqliteTable("address", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  district: text("district").notNull(),
  cityOrProvince: text("city_or_province").notNull(),
});

const order = sqliteTable("order", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => user.id),
  addressId: integer("address_id").references(() => address.id),
  createdAt: text("created_at").default(sql`current_timestamp`),
  status: text("status").notNull(),
  total: integer("total").notNull(),
});

const orderItem = sqliteTable(
  "order_item",
  {
    orderId: integer("order_id").references(() => order.id),
    productId: integer("product_id").references(() => product.id),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.orderId, table.productId] }),
    };
  },
);

module.exports = {
  user,
  admin,
  productCategory,
  productSubcategory,
  productBrand,
  brandInCategory,
  product,
  laptopProduct,
  phoneProduct,
  productImage,
  productReview,
  cart,
  cartItem,
  address,
  order,
  orderItem,
};
