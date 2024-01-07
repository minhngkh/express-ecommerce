const { body, matchedData, validationResult } = require("express-validator");

const authService = require("#components/auth/service");
const assetStorage = require("#lib/assetStorage");
const userService = require("../service");

exports.updateAddress = [
  [
    body("fullName").notEmpty(),
    body("phoneNumber").notEmpty().isMobilePhone("vi-VN"),
    body("addressLine1").notEmpty(),
    body("addressLine2").optional({ values: "falsy" }),
    body("district").notEmpty(),
    body("cityOrProvince").notEmpty(),
  ],

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Invalid address data",
          type: "danger",
        },
      });
    }

    const addressData = matchedData(req);

    try {
      await userService.updateUserAddress(req.user.id, addressData);
    } catch (err) {
      return res.status(400).json({
        error: {
          message: "Unable to update address. Please try again later!",
          type: "danger",
        },
      });
    }

    res.status(200).end();
  },
];

exports.updatePassword = [
  [
    body("currentPassword").notEmpty(),
    body("newPassword").notEmpty().isLength({ min: 6 }),
  ],

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Invalid password input",
          type: "danger",
        },
      });
    }

    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;

    try {
      if (await authService.comparePassword(id, currentPassword)) {
        await authService.updatePassword(id, newPassword);
        return res.status(200).end();
      }

      return res.status(409).json({
        error: {
          message: "Incorrect current password",
          type: "danger",
        },
      });
    } catch (err) {
      res.status(409).json({
        error: {
          message: "Unable to update password. Please try again later!",
          type: "danger",
        },
      });
    }
  },
];

exports.updateInfo = [
  [
    body("avatar")
      .optional({ checkFalsy: true })
      .custom((val) => assetStorage.isValidSource(val)),
    body("fullName").notEmpty(),
  ],

  async (req, res, _) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Invalid profile data",
          type: "danger",
        },
      });
    }

    const userData = matchedData(req);
    const promises = [];
    if (userData.avatar) {
      const { avatar: oldAvatar } = await userService.getUserInfo(req.user.id, [
        "avatar",
      ]);

      promises.push(assetStorage.deleteImage(oldAvatar));
    }
    promises.push(userService.updateUserInfo(req.user.id, userData));

    const results = await Promise.allSettled(promises);

    if (results[results.length - 1].status === "rejected") {
      return res.status(403).json({
        error: {
          message: "Unable to update profile. Please try again later!",
          type: "danger",
        },
      });
    }

    // Update session data
    req.session.userInfo.fullName = userData.fullName;

    res.status(200).end();
  },
];

exports.getAvatarUploadSignature = async (req, res, _) => {
  const sig = assetStorage.genUploadSignatures("profilePic");
  return res.status(200).json(sig);
};
