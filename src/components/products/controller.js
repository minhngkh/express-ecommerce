const productsService = require("./service");
const { currencyFormatter } = require("../../utils/formatter");
const { body } = require("express-validator");

const fmtName = {
  laptops: "Laptops",
  // phones: "Phones",
  // watches: "Watches",
};

const pageLimit = 6;
exports.renderProductsList = async (req, res, next) => {
  if (!Object.hasOwn(fmtName, req.params.category)) {
    return next(); //404
  }

  processProductQuery(req.query);
  const params = new URLSearchParams(req.query);
  params.delete("page");
  const rawQuery = params.toString();

  const category = req.params.category;

  try {
    const [products, paginationInfo, subcategories, brands] = await Promise.all(
      [
        productsService.getProductsMinimalInfoList(
          req.query,
          category,
          pageLimit,
        ),
        getProductsListPaginationInfo(req.query, category),
        productsService.getSubcategories(category),
        productsService.getBrands(category),
      ],
    );

    // Format raw number to currency
    products.forEach((e) => {
      e.price = currencyFormatter.format(e.price);
    });

    res.render(`products/products-list`, {
      title: `Shop | ${fmtName[category]}`,
      category: category,
      filter: {
        subcategories: subcategories,
        brands: brands,
      },
      products: products,
      query: req.query,
      rawQuery: rawQuery.length ? `&${rawQuery}` : "",
      page: paginationInfo,
    });
  } catch (err) {
    return next(err);
  }
};

exports.renderProductDetail = async (req, res, next) => {
  const { id, category } = req.params;
  console.log(category);
  const product = await productsService.getProductDetail(id, category);

  // Unknown product -> 404
  if (typeof product === "undefined") {
    return next();
  }

  product.price = currencyFormatter.format(product.price);

  const relatedProducts = await productsService.getRandomProducts(
    category,
    4, // Number of suggested products
    id,
  );

  relatedProducts.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });

  const reviews = await productsService.getReviews(id);

  let avgRating = null;
  if (reviews.length) {
    avgRating = productsService.calculateAvgRating(
      reviews.map((e) => e.rating),
    );
  }

  console.log(avgRating);

  res.render("products/product-detail", {
    title: `${fmtName[category]} | ${product.name}`,
    id,
    product,
    relatedProducts,
    avgRating,
    reviews,
  });
};

exports.validateReview = [
  body("rating").notEmpty().isInt({ min: 1, max: 5 }),
  body("comment").notEmpty().trim().isLength({ min: 1, max: 1000 }),
];

exports.addReview = async (req, res, _) => {
  const { productId, rating, comment } = req.body;
  try {
    await productsService.addReview(productId, rating, comment);
  } catch (err) {
    console.log(err);
  }

  res.redirect("back");
};

// Helpers

/** Parse fields of query that have multiple values to arrays
 *
 * @param {*} query Product list query
 */
function processProductQuery(query) {
  if (typeof query == "undefined") return {};

  if (Object.hasOwn(query, "categories")) {
    if (!query.categories) {
      delete query.categories;
    } else {
      query.categories = query.categories.split(",");
    }
  }

  if (Object.hasOwn(query, "brands")) {
    if (!query.brands) {
      delete query.brands;
    } else {
      query.brands = query.brands.split(",");
    }
  }
}

/** Get pagination info for a product list view
 *
 * @param {*} query Products list query
 * @param {String} category
 * @returns {Promise} Pagination info
 */
async function getProductsListPaginationInfo(query, category) {
  const total = await productsService.getTotalProductsOfCategory(
    query,
    category,
  );

  if (total === 0) {
    return {
      total: 0,
      current: 0,
      prev: null,
      next: null,
    };
  }

  const result = {
    total: Math.ceil(total / pageLimit),
    current: Number(query.page) || 1,
    prev: undefined,
    next: undefined,
  };
  result.prev = result.current === 1 ? null : result.current - 1;
  result.next = result.current === result.total ? null : result.current + 1;

  return result;
}
