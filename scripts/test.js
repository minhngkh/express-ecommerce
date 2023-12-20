require("dotenv").config();
const userService = require("../src/components/user/service");

const main = async () => {
  const user = await userService.getUserInfo(1, ["avatar", "fullName", "id"]);
  console.log(user);
};

main();
