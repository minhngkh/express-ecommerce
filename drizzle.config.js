/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./src/db/schema.js",
  out: "./drizzle/",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
};
