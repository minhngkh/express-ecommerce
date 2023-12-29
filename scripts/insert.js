require("dotenv").config();
const db = require("../src/db/client");
const { users } = require("../src/db/schema");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const email = "minhngkh@gmail.com";
const password = "minh134";
const full_name = "Minh Nguyen";

bcrypt
  .hash(password, saltRounds)
  .then(async (hash) => {
    const result = await db
      .insert(users)
      .values({
        email: email,
        password: hash,
        full_name: full_name,
      })
      .returning({
        insertedId: users.id,
      });

    console.log(result);
    console.log("Done");
  })
  .catch((err) => console.error(err.message));
