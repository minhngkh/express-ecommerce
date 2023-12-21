const db = require("../../db/client");
const { users } = require("../../db/schema");
const { eq } = require("drizzle-orm");

const fieldsDict = {
  id: users.id,
  email: users.email,
  fullName: users.full_name,
  avatar: users.avatar,
  createdAt: users.created_at,
};

/**
 *
 * @param {*} userId
 * @param {keyof fieldsDict} fields
 * @returns
 */
exports.getUserInfo = (userId, fields) => {
  if (fields.length === 0) {
    return null;
  }
  const selectedFields = fields
    .filter((key) => {
      if (key in fieldsDict) {
        return true;
      }
      throw new Error(`Invalid field: ${key}`);
    })
    .reduce((obj, key) => {
      obj[key] = fieldsDict[key];
      return obj;
    }, {});

  const query = db
    .select(selectedFields)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return query.then((val) => val[0]);
};
