import knex from "knex"
import knexfile from "knexfile"

/** @type {import("knex").Knex} */
let connection

export const getDatabaseConnection = () => {
  if (!connection) {
    connection = knex(knexfile.development)
  }

  return connection
}
