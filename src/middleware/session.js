const session = require("express-session");
const RedisStore = require("connect-redis").default;
const RedisClient = require("./redis");

const os = require("os");

module.exports = session({
  store: new RedisStore({ client: RedisClient }),
  secret: process.env.SESSION_SECRET,
  name: os.hostname(),
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  },
});
