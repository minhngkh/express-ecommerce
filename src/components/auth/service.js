const bcrypt = require("bcrypt");
const { eq, sql } = require("drizzle-orm");

const db = require("#db/client");
const { user } = require("#db/schema");

const SaltRounds = 10;

/**
 * Get user account's password by email
 * @param {String} email
 * @returns password
 */
exports.getUserPasswordByEmail = (email) => {
  const query = db
    .select({ password: user.password })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0].password : null;
  });
};

/**
 * Check if user account exists by email
 * @param {string} email
 * @returns
 */
exports.existsUser = (email) => {
  const query = db
    .select({
      val: sql`1`,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => {
    return !!val.length;
  });
};

/**
 * Create user account
 * @param {Object} userData
 * @param {string} userData.name full name
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns id of the created user account
 */
exports.createUser = (userData) => {
  return bcrypt.hash(userData.password, SaltRounds).then((hash) => {
    const query = db
      .insert(user)
      .values({
        fullName: userData.name,
        email: userData.email,
        password: hash,
      })
      .returning({ insertedId: user.id });

    return query.then((val) => {
      return val[0].insertedId;
    });
  });
};
