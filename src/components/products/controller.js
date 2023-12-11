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

  let products;
  try {
    products = await productsService.getProductsMinimalInfoList(
      req.query,
      category,
      pageLimit, // Number of products per page
    );
  } catch (err) {
    return next(err);
  }

  let totalProducts, numPages, curPage;
  if (products.length) {
    totalProducts = await productsService.getTotalProductsOfCategory(
      req.query,
      category,
    );
    numPages = Math.ceil(totalProducts / pageLimit);
    curPage = Number(req.query.page) || 1;

    // Format raw number to currency
    products.forEach((e) => {
      e.price = currencyFormatter.format(e.price);
    });
  } else {
    totalProducts = numPages = curPage = 0;
  }

  const filter = {
    subcategories: await productsService.getSubcategories(category),
    brands: await productsService.getBrands(category),
  };

  console.log(filter.brands);

  res.render(`products/products-list`, {
    title: `Shop | ${fmtName[category]}`,
    category: category,
    filter: filter,
    products: products,
    query: req.query,
    rawQuery: rawQuery.length ? `&${rawQuery}` : "",
    page: {
      total: numPages,
      current: curPage,
      prev: curPage - 1 == 0 ? null : curPage - 1,
      next: curPage + 1 > numPages ? null : curPage + 1,
    },
  });
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

/**
 *
 * @param {*} query Product query with categories and brands fields in string
 * @returns Product query with categories and brands fields parsed into array
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
