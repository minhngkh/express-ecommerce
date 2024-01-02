const reviewsService = require("#components/reviews/service");
const { currencyFormatter } = require("#utils/formatter");
const { processSearchQuery } = require("./helpers");
const productsService = require("./service");

/**
 * @enum {string}
 */
const CategoryName = {
  laptops: "Laptops",
  phones: "Phones",
};

const pageLimit = 6;
exports.renderProductList = async (req, res, next) => {
  if (!Object.hasOwn(CategoryName, req.params.category)) {
    return next(); //404
  }

  const { category } = req.params;
  const query = processSearchQuery(req.query);

  // Get raw search string
  const params = new URLSearchParams(req.query);
  params.delete("page");
  const rawQuery = params.toString();

  try {
    const [products, paginationInfo, subcategories, brands] = await Promise.all(
      [
        productsService.getProducts(category, query),
        getProductListPaginationInfo(query, category),
        productsService.getAvailableSubcategories(category),
        productsService.getAvailableBrands(category),
      ],
    );

    // Format raw number to currency
    products.forEach((e) => {
      e.price = currencyFormatter.format(e.price);
    });

    res.render(`products/product-list`, {
      title: `Shop | ${CategoryName[category]}`,

      category: category,
      filter: {
        subcategories: subcategories,
        brands: brands,
      },
      products: products,
      query: query,
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
  const product = await productsService.getProductDetails(category, id);

  // Unknown product -> 404
  if (product === null) {
    return next();
  }
  product.price = currencyFormatter.format(product.price);

  const [relatedProducts, reviews, avgRating, images] = await Promise.all([
    productsService
      .getRandomProducts(category, relatedProductsLimit, id)
      .then((val) => {
        val.forEach((e) => {
          e.price = currencyFormatter.format(e.price);
        });
        return val;
      }),
    reviewsService.getAllReviews(id),
    reviewsService.getAvgRating(id),
    productsService.getProductImages(id),
  ]);

  // Find and take the current user's review out of the list of all reviews
  let userReview = null;
  if (res.locals.isAuthenticated) {
    const indexToRemove = reviews.findIndex(
      (review) => review.userId === Number(req.user.id),
    );
    if (indexToRemove !== -1) {
      userReview = reviews.splice(indexToRemove, 1)[0];
    }
  }

  res.render("products/product-details", {
    title: `${CategoryName[category]} | ${product.name}`,

    category: category,
    product: product,
    relatedProducts: relatedProducts,
    reviews: {
      avgRating: avgRating,
      others: reviews,
      user: userReview,
    },
    images: images,
  });
};

// Helpers

/** Get pagination info for a product list view
 *
 * @param {*} query Products list query
 * @param {String} category
 * @returns {Promise} Pagination info
 */
async function getProductListPaginationInfo(query, category) {
  const total = await productsService.getNumProducts(category, query);

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
