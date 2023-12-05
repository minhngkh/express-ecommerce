const db = require("../../db/client");
const { products } = require("../../db/schema");
const { eq } = require("drizzle-orm");

exports.getAll = (category) => {
  let categoryName;
  switch (category) {
    case "laptops":
      categoryName = "Laptops";
      break;
    case "phones":
      categoryName = "Phones";
      break;
    case "tablets":
      categoryName = "Tablet";
      break;
    default:
      break;
  }

  return db.select().from(products).where(eq(products.category, categoryName));
};
