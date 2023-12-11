const passport = require("passport");
const LocalStrategy = require("passport-local");

const bcrypt = require("bcrypt");
const db = require("../db/client");
const { users } = require("../db/schema");
const { eq } = require("drizzle-orm");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, cb) => {
      const queryResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .catch((err) => {
          return cb(err);
        });

      if (!queryResult.length) {
        return cb(null, false, { message: "Incorrect email or password." });
      }

      const user = queryResult[0];

      console.log(user);

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return cb(err);
        }

        if (!result) {
          return cb(null, false, {
            message: "Incorrect email or password.",
          });
        }

        return cb(null, user);
      });
    },
  ),
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, email: user.email, avatar: user.avatar });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

module.exports = passport;
