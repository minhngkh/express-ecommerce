const db = require("../../db/client");
const { products, laptop_products } = require("../../db/schema");
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

exports.getLaptopProducts = (query) => {
  if (typeof query == "undefined") return [];

  const conditions = [];

  if (Object.hasOwn(query, "categories")) {
    if (query.categories.length === 1) {
      conditions.push(eq(laptop_products.subcategory, query.categories[0]));
    } else {
      const orConditions = query.categories.map((e) =>
        eq(laptop_products.subcategory, e),
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
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
    })
    .from(products)
    .innerJoin(laptop_products, eq(products.id, laptop_products.id))
    .where(and(...conditions))
    .orderBy(order);
};

exports.getLaptopProductDetail = (id) => {
  return db
    .select({
      name: products.name,
      price: products.price,
      brand: products.brand,
      image: products.image,
      cpu: laptop_products.cpu,
      resolution: laptop_products.resolution,
      ram: laptop_products.ram,
      storage: laptop_products.storage,
    })
    .from(products)
    .innerJoin(laptop_products, eq(products.id, laptop_products.id))
    .where(eq(products.id, id))
    .limit(1);
};

exports.getRandomProductsInCategory = (category, numProducts, except) => {
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
