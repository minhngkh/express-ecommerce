const productsService = require("./service");
const { currencyFormatter } = require("../../utils/formatter");

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
