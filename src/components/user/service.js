const { eq } = require("drizzle-orm");

const db = require("#db/client");
const { user } = require("#db/schema");
const { pick } = require("#utils/objectHelpers");

const fieldsDict = {
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  password: user.password,
  avatar: user.avatar,
  createdAt: user.createdAt,
};

/**
 *
 * @param {number} userId
 * @param {keyof fieldsDict} fields
 * @returns
 */
exports.getUserInfo = (userId, fields) => {
  if (fields.length === 0) {
    return null;
  }

  const query = db
    .select(pick(fieldsDict, fields))
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return query.then((val) => val[0]);
};

/**
 *
 * @param {string} email
 * @param {keyof fieldsDict} fields
 * @returns
 */
exports.getUserInfoFromEmail = (email, fields) => {
  if (fields.length === 0) {
    return null;
  }

  const query = db
    .select(pick(fieldsDict, fields))
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => val[0]);
};
