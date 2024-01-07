const crypto = require("crypto");
const { param, body, validationResult } = require("express-validator");

const emailSender = require("#lib/emailSender");
const authService = require("../service");

exports.sendVerificationEmail = [
  [body("id").isInt({ min: 0 }), body("email").isEmail()],

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).end();

    const { id, email } = req.body;

    try {
      const token = crypto.randomBytes(64).toString("hex");
      await authService.updateStatus(id, { token: token });

      let baseUrl;
      if (process.env.NODE_ENV === "production") {
        baseUrl = `${req.protocol}://${req.hostname}`;
      } else {
        baseUrl = `http://localhost:${process.env.PORT || 3000}`;
      }

      await emailSender.send(email, "Verify email", "verifyEmail", {
        baseUrl: baseUrl,
        id: id,
        token: token,
        email: email,
      });

      return res.status(200).end();
    } catch (err) {
      console.log(err);
      res.status(400).end();
    }
  },
];

exports.existsEmail = [
  param("email").notEmpty().isEmail(),

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).end();

    console.log(req.params.email);

    const result = await authService.existsUser(req.params.email);
    if (result) return res.status(404).end();
    return res.status(200).end();
  },
];
