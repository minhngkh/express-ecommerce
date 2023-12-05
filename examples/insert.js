require("dotenv").config();
const db = require("../src/db/client");
const { users } = require("../src/db/schema");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const username = "minhngkh";
const email = "minhngkh@gmail.com";
const password = "minh134";

bcrypt
  .hash(password, saltRounds)
  .then(async (hash) => {
    const result = await db
      .insert(users)
      .values({
        username: username,
        email: email,
        password: hash,
      })
      .returning({
        insertedId: users.id,
      });

    console.log(result);
    console.log("Done");
  })
  .catch((err) => console.error(err.message));
