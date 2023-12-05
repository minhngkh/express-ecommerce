require("dotenv").config();
const db = require("../src/db/client");
const { users, products, laptop_products } = require("../src/db/schema");
const { eq, sql, and, asc } = require("drizzle-orm");
const bcrypt = require("bcrypt");
const currencyFormatter = require("../src/utils/formatter");

const username = "minhngkh";
const password = "minh134";

// const service = require("../src/components/products/service");

async function main() {
  const query = db
    .select({
      name: products.name,
      price: products.price,
      image: products.image,
    })
    .from(products)
    .innerJoin(laptop_products, eq(products.id, laptop_products.id))
    .where(eq(laptop_products.subcategory, "Macbook"))
    .orderBy(asc(products.name));

  console.log(await query);
}

main();
