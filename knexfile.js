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
    client: 'mysql',
    connection: {
      host: 'bx96md3fnzmsg928kjq5-mysql.services.clever-cloud.com',
      user: 'uz68azoc5z6uvzmz',
      password: 'qLhslHxoD18SVQDAs4vt',
      database: 'bx96md3fnzmsg928kjq5'
    },
    migrations: {
      directory: "./src/server/database/migrations",
    },
    seeds: {
      directory: "./src/server/database/seeds",
    },
  },
}
