const { createClient } = require("@libsql/client");
const { drizzle } = require("drizzle-orm/libsql");
const schema = require("./schema");

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

module.exports = drizzle(client, { schema });
