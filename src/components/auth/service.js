const bcrypt = require("bcrypt");
const { eq, sql } = require("drizzle-orm");

const db = require("#db/client");
const { user } = require("#db/schema");

const SaltRounds = 10;

const utcTimeField = (field) => {
  return sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${field})`;
};

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
 * @param {string} [userData.token] account verification token
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
        ...(userData.token
          ? {
              token: userData.token,
              tokenExpiration: sql`datetime('now', '+1 hour')`,
            }
          : {}),
      })
      .returning({ insertedId: user.id });

    return query.then((val) => {
      return val[0].insertedId;
    });
  });
};

/**
 *
 * @param {Number} userId
 * @param {object} status
 * @param {boolean} [isVerified]
 * @param {?string} [token]
 * @returns
 */
exports.updateStatus = async (id, status) => {
  const newValue = {};
  if (Object.hasOwn(status, "isVerified")) {
    newValue.isVerified = status.isVerified;
  }

  if (Object.hasOwn(status, "token")) {
    newValue.token = status.token;
    newValue.tokenExpiration =
      status.token !== null ? sql`datetime('now', '+1 hour')` : null;
  }

  const query = db.update(user).set(newValue).where(eq(user.id, id)).returning({
    updatedId: user.id,
  });

  return query;
};

/**
 * Get token of user account by email
 * @param {String} email
 * @returns
 */
exports.getTokenByEmail = async (email) => {
  const query = db
    .select({
      value: user.token,
      expiration: user.tokenExpiration,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};

/**
 * Get token of user account by user id
 * @param {number} userId
 * @returns
 */
exports.getTokenById = (userId, includeEmail = false) => {
  const query = db
    .select({
      value: user.token,
      expiration: utcTimeField(user.tokenExpiration),
      ...(includeEmail ? { ofEmail: user.email } : {}),
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};

/**
 * Get email by token
 * @param {String} token
 * @returns
 */
exports.getEmailByToken = async (token) => {
  const query = db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.token, token))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0].email : null;
  });
}

/**
 * Change password of user account with email
 * @param {String} email
 * @param {String} newPassword
 * @returns
 */
exports.changePassword = async (email, newPassword) => {
  return bcrypt.hash(newPassword, SaltRounds).then((hash) => {
    const query = db
      .update(user)
      .set({
        password: hash,
      })
      .where(eq(user.email, email));

    return query.then((val) => {
      return val;
    });
  });
};
