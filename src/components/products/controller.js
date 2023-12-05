const productsService = require("./service");
const { currencyFormatter } = require("../../utils/formatter");
const { body } = require("express-validator");

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

exports.renderLaptopProductsList = async (req, res, _) => {
  processProductQuery(req.query);
  const products = await productsService.getLaptopProducts(req.query);

  products.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });

  res.render(`products/laptops-list`, { products: products, query: req.query });
};

exports.renderLaptopProductDetail = async (req, res, _) => {
  const productId = req.params.id;
  const query = await productsService.getLaptopProductDetail(productId);

  const product = query[0];
  product.price = currencyFormatter.format(product.price);

  const relatedProducts = await productsService.getRandomProductsInCategory(
    "Laptops",
    4,
    productId,
  );

  relatedProducts.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });

  const reviews = await productsService.getReviews(productId);

  let avgRating = null;
  if (reviews.length) {
    avgRating = productsService.calculateAvgRating(
      reviews.map((e) => e.rating),
    );
  }

  console.log(avgRating);

  res.render("products/product-detail", {
    product,
    relatedProducts,
    productId,
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
