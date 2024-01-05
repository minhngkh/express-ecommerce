const express = require("express");

const authApiController = require("./controller");

const router = express.Router();

router.post("/verify/resend/", authApiController.sendVerificationEmail);

module.exports = router;
