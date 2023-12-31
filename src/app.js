const express = require("express");
const hbs = require("hbs");
const hbsLayouts = require("handlebars-layouts");
const createError = require("http-errors");
const logger = require("morgan");
const path = require("path");

const authenticated = require("#middlewares/authenticated");
const passport = require("#middlewares/passport");
const session = require("#middlewares/session");
const hbsHelpers = require("#utils/hbsHelpers");

const apiAuthRouter = require("#components/auth/api/router");
const apiCartRouter = require("#components/cart/api/router");
const apiOrdersRouter = require("#components/orders/api/router");
const apiProductsRouter = require("#components/products/api/router");
const apiUserRouter = require("#components/user/api/router");

const authRouter = require("#components/auth/router");
const cartRouter = require("#components/cart/router");
const checkoutRouter = require("#components/checkout/router");
const homeRouter = require("#components/home/router");
const ordersRouter = require("#components/orders/router");
const productsRouter = require("#components/products/router");
const testRouter = require("#components/test/router");
const userRouter = require("#components/user/router");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.static(path.join(__dirname, "./views/reports")));


app.use(logger("dev"));

// TODO: Implement CSRF protection
// Setup Passport
app.use(session);
app.use(passport.authenticate("session"));

// Add user authentication status to locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use(authenticated.updateCartInfoInSession);

// Setup routes
app.use("/api/auth", apiAuthRouter);
app.use("/api/cart", apiCartRouter);
app.use("/api/orders", apiOrdersRouter);
app.use("/api/products", apiProductsRouter);
app.use("/api/user", apiUserRouter);

app.use(authenticated.updateUserInfoInSession(["fullName"]));

//Set the user info to locals for view engine access
app.use((req, res, next) => {
  if (res.locals.isAuthenticated) {
    res.locals.user = Object.assign({}, req.user, req.session.userInfo);
  }
  next();
});

app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", ordersRouter);
app.use("/products", productsRouter);
app.use("/user", userRouter);

// Testing
app.use("/test", testRouter);
const reportRouter = require("#components/reports/router");
app.use("/report", reportRouter);

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
