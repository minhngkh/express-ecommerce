const passport = require("passport");
const LocalStrategy = require("passport-local");

const bcrypt = require("bcrypt");
const db = require("../db/client");
const { users } = require("../db/schema");
const { eq } = require("drizzle-orm");

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const queryResult = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .catch((err) => {
        return cb(err);
      });

    if (!queryResult.length) {
      return cb(null, false, { message: "Incorrect username or password." });
    }

    const user = queryResult[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return cb(err);
      }

      if (!result) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }

      return cb(null, user);
    });
  }),
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

module.exports = passport;
