const express = require("express");

const authenticated = require("#middlewares/authenticated");
const authController = require("./controller");

const router = express.Router();

router.get(
  "/signup",
  authenticated.redirect(),
  authController.renderSignUpForm,
);

router.get(
  "/signin",
  authenticated.redirect(),
  authController.renderSignInForm,
);

router.get("/signout", authController.signOut);

router.post(
  "/signin",
  authController.validateSignInCredentials,
  authController.retainSessionInfo,
  authController.authenticateSignInCredentials,
  authController.processOnSuccess,
);

router.post(
  "/signup",
  authController.validateSignUpCredentials,
  authController.retainSessionInfo,
  authController.authenticateSignUpCredentials,
  authController.verifyEmail,
  authController.processOnSuccess,
);

router.get("/verify/:id/:token", authController.tokenVerification);

router.get("/forgot-password", authController.renderForgotPasswordForm);

router.post(
  "/forgot-password",
  // authController.validateForgotPasswordCredentials,
  authController.sendResetPasswordEmail,
);

router.get("/forgot-password/:token/:email/:password", authController.verifyPasswordResetToken);

module.exports = router;
