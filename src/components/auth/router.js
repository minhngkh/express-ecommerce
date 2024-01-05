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
  // authController.retainSessionInfo,
  authController.authenticateSignUpCredentials,
  authController.sendVerificationEmail,
);

router.get(
  "/verify/:id/:token",
  authController.retainSessionInfo,
  authController.verifyToken,
  authController.processOnSuccess,
  authController.renderVerificationMessage,
);

// Reset password here
router.get("/forgot-password", authController.renderForgotPasswordForm);
router.post(
  "/forgot-password",
  // authController.validateForgotPasswordCredentials,
  authController.sendResetPasswordEmail,
);

router.get("/forgot-password/verify/:token/", authController.verifyPasswordResetToken);
router.post("/forgot-password/reset-password/:token/", authController.resetPassword);

module.exports = router;
