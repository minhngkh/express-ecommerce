const userService = require("./service");
const createError = require("http-errors");

exports.renderProfile = async (req, res, next) => {
  const query = await userService.getUserFullName(req.user.id);
  if (!query.length) {
    return next(createError(500));
  }

  res.render("user/profile", {
    title: "Profile",
    user: {
      email: req.user.email,
      fullName: query[0].fullName,
    },
  });
};
