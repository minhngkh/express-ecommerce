const createError = require("http-errors");

const userService = require("./service");

exports.renderProfile = async (req, res, next) => {
  const result = await userService.getUserInfoWithAddress(req.user.id);
  if (!result) return next(createError(500));

  const msg = req.session.message;
  req.session.message = null;

  res.render("user/profile", {
    title: "Profile",
    user: result,
    toast: msg ? [msg.content, { type: msg.type }] : null,
  });
};
