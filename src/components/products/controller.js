const productsService = require("./service");
const reviewsService = require("../reviews/service");
const { currencyFormatter } = require("../../utils/formatter");

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

const relatedProductsLimit = 4;
exports.renderProductDetail = async (req, res, next) => {
  const { id, category } = req.params;
  const product = await productsService.getProductDetail(id, category);

  // Unknown product -> 404
  if (product === null) {
    return next();
  }
  product.price = currencyFormatter.format(product.price);

  const [relatedProducts, reviews] = await Promise.all([
    productsService
      .getRandomProducts(category, relatedProductsLimit, id)
      .then((val) => {
        val.forEach((e) => {
          e.price = currencyFormatter.format(e.price);
        });
        return val;
      }),
    reviewsService.getAllReviews(id),
  ]);

  const avgRating = reviews.length
    ? reviewsService.calculateAvgRating(reviews)
    : null;

  // Find and take the current user's review out of the list of all reviews
  let userReview = null;
  const indexToRemove = reviews.findIndex(
    (review) => review.userId === Number(req.user.id),
  );
  if (indexToRemove !== -1) {
    userReview = reviews.splice(indexToRemove, 1)[0];
  }

  res.render("products/product-detail", {
    title: `${fmtName[category]} | ${product.name}`,
    product: {
      ...product,
      id: id,
    },
    relatedProducts: relatedProducts,
    reviews: {
      avgRating: avgRating,
      others: reviews,
      user: userReview,
    },
  });
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
