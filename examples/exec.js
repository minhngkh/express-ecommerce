require("dotenv").config();
const db = require("../src/db/client");
const { users } = require("../src/db/schema");
const { eq, sql } = require("drizzle-orm");
const bcrypt = require("bcrypt");
const currencyFormatter = require("../src/utils/formatter");

const username = "minhngkh";
const password = "minh134";

const service = require("../src/components/products/service");

async function main() {
  const products = await service.getAll("Laptops");

  products.forEach((e) => {
    e.price = currencyFormatter.format(e.price);
  });
  console.log(products);
}

main();
