const express = require("express");

const authenticated = require("#middlewares/authenticated");
const userApiController = require("./controller");

const router = express.Router();

router.use("/", authenticated.require);

router.put("/address", userApiController.updateAddress);

router.post("/password", userApiController.updatePassword);

router.put("/info", userApiController.updateInfo);

router.get(
  "/avatar/upload_signature",
  userApiController.getAvatarUploadSignature,
);

module.exports = router;
