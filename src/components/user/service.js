const db = require("../../db/client");
const { users } = require("../../db/schema");
const { eq } = require("drizzle-orm");

exports.getUserFullName = (id) => {
  const query = db
    .select({
      fullName: users.full_name,
    })
    .from(users)
    .where(eq(users.id, id));

  return query.then((result) => {
    return result[0].fullName;
  });
};
