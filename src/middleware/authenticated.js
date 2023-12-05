exports.require = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log("Not authenticated");
    return res.render("unauthorized", {
      title: "Unauthorized",
      buttons: [
        { name: "Login", route: "/auth/login" },
        { name: "Register", route: "/auth/register" },
      ],
    });
  }
  next();
};

exports.redirect = (des) => {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect(des);
    }
    next();
  };
};
