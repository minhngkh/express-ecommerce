const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const hbs = require("hbs");
const hbsHelpers = require("./utils/hbs-helpers");
const passport = require("./middleware/passport");
const session = require("./middleware/session");

const homeRouter = require("./components/home/router");
const productsRouter = require("./components/products/router");
// const authRouter = require("./components/auth/router");
// const protectedRouter = require("./components/protected/router");
// const testRouter = require("./components/test/router");

// Init Express app
const app = express();

// Trust proxy in order to make session work when deploying on fly.io
app.set("trust proxy", 1);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/partials"));
hbs.registerHelper("parseJSON", hbsHelpers.parseJSON);
hbs.registerHelper("comp", hbsHelpers.comp);
hbs.registerHelper("in", hbsHelpers.in);
// app.set("view options", { layout: "layout/default.hbs" });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// TODO: Implement CSRF protection
// Setup Passport
app.use(session);
app.use(passport.authenticate("session"));

app.use("/", homeRouter);
app.use("/products/", productsRouter);
// app.use("/protected", protectedRouter);
// app.use("/test", testRouter);

// Catch 404 and forward to error handler
app.use((req, res, _) => {
  res.render("404");
});

// Error handler
app.use((err, req, res, _) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
