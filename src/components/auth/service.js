const bcrypt = require("bcrypt");
const { eq, sql } = require("drizzle-orm");

const db = require("#db/client");
const { user } = require("#db/schema");

const SaltRounds = 10;

const utcTimeField = (field) => {
  return sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${field})`;
};

/**
 * Get user account's password by id
 * @param {number} userId
 * @returns password
 */
exports.getUserPasswordById = (userId) => {
  const query = db
    .select({ password: user.password })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0].password : null;
  });
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

//TODO: move to user component
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

//TODO: move to user component
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
 * Change password of user account
 * @param {String} userId
 * @param {String} newPassword
 * @returns
 */
exports.updatePassword = (userId, newPassword) => {
  return bcrypt.hash(newPassword, SaltRounds).then((hash) => {
    return db
      .update(user)
      .set({
        password: hash,
      })
      .where(eq(user.id, userId));
  });
};

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
    return db
      .update(user)
      .set({
        password: hash,
      })
      .where(eq(user.email, email));
  });
};

exports.comparePassword = (userId, password) => {
  const query = db
    .select({ password: user.password })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return query.then((val) => {
    if (!val.length) throw new Error("User not found");
    return bcrypt.compare(password, val[0].password);
  });
};

/**
 * Get user account by email
 * @param {String} email
 * @returns
 */
exports.getUserByEmail = async (email) => {
  const query = db
    .select({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      token: user.token,
      tokenExpiration: utcTimeField(user.tokenExpiration),
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};