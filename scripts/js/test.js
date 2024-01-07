require("dotenv").config();

const service = require("#components/auth/service");
const assetStorage = require("#lib/assetStorage");
const db = require("#db/client");
const { order, orderItem, address } = require("#db/schema");

const main = async () => {
  console.log(await service.existsUser("minhngkhs@gmail.com"));
};

main();
