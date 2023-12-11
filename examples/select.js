require("dotenv").config();
const db = require("../src/db/client");
const { users } = require("../src/db/schema");
const { eq, sql, exists } = require("drizzle-orm");
const bcrypt = require("bcrypt");
const { SQLiteBoolean } = require("drizzle-orm/sqlite-core");

const userService = require("../src/components/auth/service");

const username = "minhngkh2";
const password = "minh134";
const email = "minhngkh@gmail.com";

async function compare() {
  const result = await db
    .select({
      password: users.password,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  bcrypt
    .compare(password, result[0].password)
    .then((res) => {
      console.log(res); // return true
    })
    .catch((err) => console.error("error: ", err.message));
}

async function check() {
  const result = await db.run(
    sql`select exists(${db
      .select()
      .from(users)
      .where(eq(users.username, username))}) as exists`,
  );

  console.log(result, typeof result);
}

async function check2(email) {
  const query = await db
    .select({ 1: sql`1` })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  console.log(query);
}

check2(email);
