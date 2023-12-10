const db = require("../../db/client");
const { users } = require("../../db/schema");
const { eq } = require("drizzle-orm");

exports.getUserFullName = (id) => {
  return db
    .select({
      fullName: users.full_name,
    })
    .from(users)
    .where(eq(users.id, id));
};
