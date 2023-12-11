require("dotenv").config();

const userService = require("../src/components/auth/service");

const email = "test2@gmail.com";
const password = "test12345";

async function insert() {
  const result = await userService.createUser({
    email: email,
    password: password,
  });

  console.log(result);
}

insert();
