/**
 * 
 * @param {import("knex").Knex} knex 
 */
exports.up = async function (knex) {
  await knex.schema.createTable("refresh_tokens", (table) => {
    table.string("token").unique().notNullable()
    table.integer("user_id").unique().notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable("refresh_tokens")
}
