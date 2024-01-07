const {
  asc,
  and,
  desc,
  eq,
  gte,
  like,
  lte,
  ne,
  or,
  sql,
  count,
} = require("drizzle-orm");

const db = require("#db/client");
const {
  laptopProduct,
  phoneProduct,
  product,
  productBrand,
  productImage,
  productSubcategory,
} = require("#db/schema");
const { omit } = require("#utils/objectHelpers");

const ProductExtendedTable = {
  laptops: laptopProduct,
  phones: phoneProduct,
};

/**
 * @enum {string}
 */
const ListOrder = {
  NameAsc: "name-asc",
  NameDesc: "name-desc",
  PriceAsc: "price-asc",
  PriceDesc: "price-desc",
};

const IsDeletedCondition = eq(product.isDeleted, false);

/**
 * @typedef {Object} Query
 * @property {?string[]} subcategories
 * @property {?string[]} brands
 * @property {?string} name
 * @property {?number} minPrice
 * @property {?number} maxPrice
 * @property {number} limit
 * @property {number} page
 * @property {?ListOrder} sort
 */

// TODO: Total purchases sort
/**
 * Get list of products matching query in the category
 * @param {keyof ProductExtendedTable} category
 * @param {Query} query
 * @returns
 */
exports.getProducts = (category, query) => {
  const { order } = processQuery(query);
  if (order === null) return [];

  const conditions = createConditionsList(query);

  return db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage.source,
    })
    .from(product)
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    )
    .innerJoin(productBrand, eq(product.brandId, productBrand.id))
    .innerJoin(
      productSubcategory,
      eq(product.subcategoryId, productSubcategory.id),
    )
    .leftJoin(
      productImage,
      and(
        eq(product.id, productImage.productId),
        eq(productImage.isPrimary, true),
      ),
    )
    .where(and(...conditions, IsDeletedCondition))
    .orderBy(order)
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);
};

/**
 * Get subcategories of available products in a category
 * @param {keyof ProductExtendedTable} category
 * @returns List of subcategory names
 */
exports.getAvailableSubcategories = (category) => {
  const query = db
    .selectDistinct({
      name: productSubcategory.name,
    })
    .from(productSubcategory)
    .innerJoin(product, eq(product.subcategoryId, productSubcategory.id))
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    );

  return query.then((val) => {
    return val.map((e) => e.name);
  });
};

/**
 * Get brand names of available products in a category
 * @param {keyof ProductExtendedTable} category
 * @returns List of brand names
 */
exports.getAvailableBrands = (category) => {
  const query = db
    .selectDistinct({
      name: productBrand.name,
    })
    .from(productBrand)
    .innerJoin(product, eq(product.brandId, productBrand.id))
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    );

  return query.then((val) => {
    return val.map((e) => e.name);
  });
};

/**
 * Get details of a product
 * @param {keyof ProductExtendedTable} category
 * @param {number} id
 * @returns
 */
exports.getProductDetails = (category, id) => {
  const query = db
    .select()
    .from(product)
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    )
    .innerJoin(productBrand, eq(product.brandId, productBrand.id))
    .where(and(eq(product.id, id), IsDeletedCondition))
    .limit(1);

  return query.then((val) => {
    if (!val.length) return null;

    return {
      id: val[0].product.id,
      name: val[0].product.name,
      price: val[0].product.price,
      brand: val[0].product_brand.name,
      status: val[0].product.status,
      category: category,
      details: Object.values(omit(val[0], ["product", "product_brand"]))[0],
    };
  });
};

exports.getProductImages = (id) => {
  const query = db
    .select({
      id: productImage.id,
      source: productImage.source,
      isPrimary: productImage.isPrimary,
    })
    .from(productImage)
    .where(eq(productImage.productId, id));

  return query.then((val) => {
    if (!val.length) return null;
    return {
      primary: val.find((e) => e.isPrimary === true).source,
      extras: val.filter((e) => e.isPrimary === false).map((e) => e.source),
    };
  });
};

/**
 * Get random products in the same category
 * @param {keyof ProductExtendedTable} category
 * @param {number} limit
 * @param {number} exceptId
 * @returns
 */
exports.getRandomProducts = (category, limit, exceptId) => {
  return db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage.source,
    })
    .from(product)
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    )
    .leftJoin(
      productImage,
      and(
        eq(product.id, productImage.productId),
        eq(productImage.isPrimary, true),
      ),
    )
    .where(
      and(
        // eq(product.subcategoryId, exceptId),
        ne(product.id, exceptId),
        IsDeletedCondition,
      ),
    )
    .orderBy(sql`random()`)
    .limit(limit);
};

/**
 * Get number of products matching query in the category
 * @param {keyof ProductExtendedTable} category
 * @param {Query} query
 * @returns
 */
exports.getNumProducts = (category, query) => {
  const conditions = createConditionsList(query);
  const dbQuery = db
    .select({
      count: count(),
    })
    .from(product)
    .innerJoin(
      ProductExtendedTable[category],
      eq(product.id, ProductExtendedTable[category].productId),
    )
    .innerJoin(productBrand, eq(product.brandId, productBrand.id))
    .leftJoin(
      productSubcategory,
      eq(product.subcategoryId, productSubcategory.id),
    )
    .where(and(...conditions, IsDeletedCondition));

  return dbQuery.then((val) => {
    return val[0].count;
  });
};

// Helper functions

/**
 * Validate and add default values to query
 * @param {Query} query
 * @returns
 */
const processQuery = (query) => {
  const result = {
    order: null,
  };

  if (query.sort === null) {
    result.order = asc(product.name);
  } else {
    switch (query.sort) {
      case ListOrder.NameAsc:
        result.order = asc(product.name);
        break;
      case ListOrder.NameDesc:
        result.order = desc(product.name);
        break;
      case ListOrder.PriceAsc:
        result.order = asc(product.price);
        break;
      case ListOrder.PriceDesc:
        result.order = desc(product.price);
        break;
      default:
        break;
    }
  }

  return result;
};

/**
 * Create conditions list from query
 * @param {Query} query
 * @returns
 */
const createConditionsList = (query) => {
  const conditions = [];

  if (query.subcategories !== null) {
    if (query.subcategories.length === 1) {
      conditions.push(eq(productSubcategory.name, query.subcategories[0]));
    } else {
      conditions.push(
        or(...query.subcategories.map((s) => eq(productSubcategory.name, s))),
      );
    }
  }

  if (query.brands !== null) {
    if (query.brands.length === 1) {
      conditions.push(eq(productBrand.name, query.brands[0]));
    } else {
      conditions.push(or(...query.brands.map((s) => eq(productBrand.name, s))));
    }
  }

  if (query.name !== null) {
    conditions.push(like(product.name, `%${query.name}%`));
  }

  if (query.minPrice !== null) {
    conditions.push(gte(product.price, query.minPrice));
  }

  if (query.maxPrice !== null) {
    conditions.push(lte(product.price, query.maxPrice));
  }

  return conditions;
};

/**
 * Get prices for list of products
 * @param {number[]} productIds
 * @returns
 */
exports.getPrices = (productIds) => {
  const query = db
    .select({
      id: product.id,
      price: product.price,
    })
    .from(product)
    .where(or(...productIds.map((id) => eq(product.id, id))));

  return query.then((val) => {
    return Object.assign({}, ...val.map((e) => ({ [e.id]: e.price })));
  });
};
