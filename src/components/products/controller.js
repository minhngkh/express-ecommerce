const productsService = require("./service");
const { currencyFormatter } = require("../../utils/formatter");
const { body } = require("express-validator");

const categoriesDict = {
  laptops: {
    fmtName: "Laptops",
    func: productsService.getProductsMinimalInfoList,
  },
  phones: {
    fmtName: "Phones",
    func: undefined,
  },
  watches: {
    fmtName: "Watches",
    func: undefined,
  },
};

exports.renderProductsList = async (req, res, _) => {
  processProductQuery(req.query);

  const category = req.params.category;
  const products = await productsService.getProductsMinimalInfoList(
    req.query,
    category,
  );

  products.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });

  res.render(`products/products-list`, {
    title: `Shop | ${categoriesDict[category].fmtName}`,
    products: products,
    query: req.query,
  });
};

exports.renderProductDetail = async (req, res, next) => {
  const { id, category } = req.params;
  console.log(category);
  const query = await productsService.getProductDetail(id, category);

  // Unknown product -> 404
  if (!query.length) {
    return next();
  }

  const product = query[0];
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
    title: `${categoriesDict[category].fmtName} | ${product.name}`,
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
