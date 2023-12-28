const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const usersServices = require("#components/user/service");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, cb) => {
      const account = {
        email: email,
      };
      try {
        const result = await usersServices.getUserInfoFromEmail(email, [
          "id",
          "password",
        ]);

        Object.assign(account, result);
      } catch (err) {
        return cb(null, false, { message: "Incorrect email." });
      }

      bcrypt.compare(password, account.password, (err, result) => {
        if (err) {
          return cb(err);
        }

        if (!result) {
          return cb(null, false, {
            message: "Incorrect password.",
          });
        }

        return cb(null, account);
      });
    },
  ),
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, email: user.email });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

module.exports = passport;
