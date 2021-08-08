module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./db.sqlite"
    },
    migrations: {
      directory: "./src/server/database/migrations",
    },
    seeds: {
      directory: "./src/server/database/seeds",
    },
    useNullAsDefault: true,
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: "./db.sqlite"
    },
    migrations: {
      directory: "./src/server/database/migrations",
    },
    seeds: {
      directory: "./src/server/database/seeds",
    },
    useNullAsDefault: true,
  },
}
