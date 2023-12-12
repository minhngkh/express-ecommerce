const express = require("express");
const createError = require("http-errors");
const path = require("path");
const logger = require("morgan");
const hbs = require("hbs");
const hbsLayouts = require("handlebars-layouts");
const hbsHelpers = require("./utils/hbs-helpers");
const passport = require("./middleware/passport");
const session = require("./middleware/session");

const apiRouter = require("./api/router");
const homeRouter = require("./components/home/router");
const productsRouter = require("./components/products/router");
const authRouter = require("./components/auth/router");
const userRouter = require("./components/user/router");

// Init Express app
const app = express();

// Trust proxy in order to make session work when deploying on fly.io
app.set("trust proxy", 1);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/partials"));
hbs.registerHelper(hbsHelpers);
hbs.registerHelper(hbsLayouts(hbs.handlebars));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// TODO: Implement CSRF protection
// Setup Passport
app.use(session);
app.use(passport.authenticate("session"));

// Add user authentication status to locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Setup routes
app.use("/api", apiRouter);

app.use("/", homeRouter);
app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, _) => {
  // Set locals, only providing error in development
  res.locals.status = err.status || 500;
  res.locals.message = err.status ? err.message : "Internal Server Error";
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(res.locals.status);
  res.render("error");
});

module.exports = app;
