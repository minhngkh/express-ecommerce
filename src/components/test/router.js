const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from test router");
});

router.get("/user-locals", (req, res) => {
  res.json(res.locals.user);
});

const sendEmail = require("../../lib/nodemailer.lib");
router.get("/send-email", async (req, res) => {

  const email = "ncathinh21@clc.fitus.edu.vn";
  const subject = "Test email";
  const template = "email";
  const context = { name: "Thinh" };

  await sendEmail(email, subject, template, context);
  res.send("Email sent");
});

router.get("/verify/:token", (req, res) => {
  res.send(req.params.token);
});

router.get("/reset", async (req, res) => {
  const email = "ncathinh21@clc.fitus.edu.vn";
  await sendEmail(email, "Reset password", "resetPasswordEmail", { name: "Thinh" });
  res.send("Email sent");
});

const userService = require("../auth/service");
router.post("/reset-password", (req, res) => {
  if (req.body.password !== req.body["confirm-password"]) {
    res.send(req.body.password + " " + req.body["confirm-password"]);
  }
  const { token } = req.params;
  const userID = 1;
  userService.changePassword(userID, req.body.password);
  res.send("Password changed");
});

router.get("/reset-password", (req, res) => {
  res.render("sendResetPassword");
});

module.exports = router;
