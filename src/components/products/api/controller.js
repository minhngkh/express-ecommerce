const productsService = require("../service");
const { processSearchQuery } = require("../helpers");
const { currencyFormatter } = require("#utils/formatter");

exports.getProductList = async (req, res, _) => {
  const { category } = req.params;
  const query = processSearchQuery(req.query);

  try {
    const [products, totalProducts] = await Promise.all([
      productsService.getProducts(category, query),
      productsService.getNumProducts(category, query),
    ]);

    // Format raw number to currency
    products.forEach((e) => {
      e.price = currencyFormatter.format(e.price);
    });

    const totalPages = Math.ceil(totalProducts / query.limit);

    return res.status(200).json({
      productList: products,
      total: totalPages,
      current: query.page,
    });
  } catch (err) {
    res.status(400).end();
  }
};
