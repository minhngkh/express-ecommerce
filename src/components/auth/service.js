const db = require("../../db/client");
const bcrypt = require("bcrypt");
const { users } = require("../../db/schema");
const { eq } = require("drizzle-orm");

exports.getUserPasswordByEmail = (email) => {
  return db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
};

const saltRounds = 10;

exports.createUser = (user) => {
  return bcrypt
    .hash(user.password, saltRounds)
    .then((hash) => {
      return db
        .insert(users)
        .values({
          email: user.email,
          password: hash,
        })
        .returning({ insertedId: users.id });
    })
    .then((result) => {
      return result;
    });
};