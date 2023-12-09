const db = require("../../db/client");
const {
  products,
  laptop_products,
  temp_product_reviews,
} = require("../../db/schema");
const {
  ne,
  eq,
  and,
  like,
  or,
  lte,
  gte,
  asc,
  desc,
  sql,
} = require("drizzle-orm");

const minimalInfo = {
  id: products.id,
  name: products.name,
  price: products.price,
  image: products.image,
};

const generalInfo = {
  name: products.name,
  price: products.price,
  brand: products.brand,
  image: products.image,
};

const categoriesDict = {
  laptops: {
    table: laptop_products,
    detailedInfo: {
      cpu: laptop_products.cpu,
      resolution: laptop_products.resolution,
      ram: laptop_products.ram,
      storage: laptop_products.storage,
    },
  },
};

/**
 *
 * @param {*} query Get products list of a category with filtering and sorting applied
 * @param {*} category Category of the products list (laptops/phones/watches)
 * @returns List of products with minimal info
 */
exports.getProductsMinimalInfoList = (query, category) => {
  if (typeof query == "undefined") return [];

  const conditions = [];

  if (Object.hasOwn(query, "categories")) {
    if (query.categories.length === 1) {
      conditions.push(
        eq(categoriesDict[category].table.subcategory, query.categories[0]),
      );
    } else {
      const orConditions = query.categories.map((e) =>
        eq(categoriesDict[category].table.subcategory, e),
      );
      conditions.push(or(...orConditions));
    }
  }

  if (Object.hasOwn(query, "brands")) {
    if (query.brands.length === 1) {
      conditions.push(eq(products.brand, query.brands[0]));
    } else {
      const orConditions = query.brands.map((e) => eq(products.brand, e));
      conditions.push(or(...orConditions));
    }
  }

  if (Object.hasOwn(query, "search")) {
    conditions.push(like(products.name, `%${query.search}%`));
  }

  if (Object.hasOwn(query, "minPrice")) {
    conditions.push(gte(products.price, query.minPrice));
  }

  if (Object.hasOwn(query, "maxPrice")) {
    conditions.push(lte(products.price, query.maxPrice));
  }

  let order = asc(products.name);
  if (Object.hasOwn(query, "sort")) {
    switch (query.sort) {
      case "name-asc":
        order = asc(products.name);
        break;
      case "name-desc":
        order = desc(products.name);
        break;
      case "price-asc":
        order = asc(products.price);
        break;
      case "price-desc":
        order = desc(products.price);
        break;
      default:
        break;
    }
  }

  return db
    .select(minimalInfo)
    .from(products)
    .innerJoin(
      categoriesDict[category].table,
      eq(products.id, categoriesDict[category].table.id),
    )
    .where(and(...conditions))
    .orderBy(order);
};

/**
 *
 * @param {*} id Product id
 * @returns Detailed info of the product
 */
exports.getProductDetail = (id, category) => {
  return db
    .select({
      ...generalInfo,
      ...categoriesDict[category].detailedInfo,
    })
    .from(products)
    .innerJoin(laptop_products, eq(products.id, laptop_products.id))
    .where(eq(products.id, id))
    .limit(1);
};

exports.getRandomProducts = (category, numProducts, except) => {
  return db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
    })
    .from(products)
    .where(and(eq(products.category, category), ne(products.id, except)))
    .orderBy(sql`random()`)
    .limit(numProducts);
};

// Reviews related
exports.addReview = (productId, rating, comment) => {
  return db.insert(temp_product_reviews).values({
    product_id: productId,
    rating: rating,
    comment: comment,
  });
};

exports.getReviews = (productId) => {
  return db
    .select()
    .from(temp_product_reviews)
    .where(eq(temp_product_reviews.product_id, productId));
};

exports.calculateAvgRating = (ratings) => {
  const sum = ratings.reduce((acc, e) => acc + e, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};
