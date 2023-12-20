const userService = require("./service");
const createError = require("http-errors");

exports.renderProfile = async (req, res, next) => {
  const result = await userService.getUserInfo(req.user.id, ["fullName"]);
  const fullName = result.fullName;

  if (typeof fullName === "undefined") {
    return next(createError(500));
  }

  res.render("user/profile", {
    title: "Profile",
    user: {
      email: req.user.email,
      fullName: fullName,
    },
  });
};
