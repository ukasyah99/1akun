/**
 * 
 * @param {import("knex").Knex} knex 
 */
exports.up = async function(knex) {
  await knex.schema.createTable("roles", (table) => {
    table.increments()
    table.string("name").notNullable()
    table.boolean("is_opening_registration").notNullable()
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable("roles")
}
