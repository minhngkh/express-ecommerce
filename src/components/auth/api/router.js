const express = require("express");

const authApiController = require("./controller");

const router = express.Router();

router.post("/verify/resend/", authApiController.sendVerificationEmail);

router.get("/availability/email/:email", authApiController.existsEmail);

module.exports = router;
