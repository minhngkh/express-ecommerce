const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
});

client.connect().catch((err) => {
  console.error(err);
});

module.exports = client;
