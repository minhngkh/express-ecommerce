const productsService = require("./service");
const { currencyFormatter } = require("../../utils/formatter");

const supportedPages = ["laptops", "phones"];

exports.renderProductsList = async (req, res, next) => {
  const productType = req.params.type;

  console.log(productType);

  if (!supportedPages.includes(productType)) {
    return next(); // 404
  }
  console.log(req.query);
  const products = await productsService.getAll(productType);

  products.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });

  res.render(`products/${productType}-list`, { products });
};
