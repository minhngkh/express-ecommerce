const DefaultListLimit = 6;

/**
 *
 * @param {Object} searchQuery
 * @param {string} [searchQuery.subcategory]
 * @param {string} [searchQuery.brand]
 * @param {string} [searchQuery.name]
 * @param {string} [searchQuery.minPrice]
 * @param {string} [searchQuery.maxPrice]
 * @param {string} [searchQuery.limit]
 * @param {string} [searchQuery.page]
 * @param {string} [searchQuery.sort]
 * @returns
 */
exports.processSearchQuery = (searchQuery) => {
  return {
    subcategories: searchQuery.subcategory
      ? searchQuery.subcategory.split(",")
      : null,

    brands: searchQuery.brand ? searchQuery.brand.split(",") : null,

    name: searchQuery.name ? searchQuery.name : null,

    minPrice: searchQuery.minPrice ? Number(searchQuery.minPrice) : null,

    maxPrice: searchQuery.maxPrice ? Number(searchQuery.maxPrice) : null,

    limit: searchQuery.limit ? Number(searchQuery.limit) : DefaultListLimit,

    page: searchQuery.page ? Number(searchQuery.page) : 1,

    sort: searchQuery.sort ? searchQuery.sort : null,
  };
};
