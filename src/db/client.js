const { createClient } = require("@libsql/client");
const { drizzle } = require("drizzle-orm/libsql");

const schema = require("./schema");

let client;
if (process.env.DB === "local") {
  client = createClient({
    url: process.env.DATABASE_LOCAL_PATH,
    syncUrl: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
} else {
  client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
}

module.exports = drizzle(client, { schema });
