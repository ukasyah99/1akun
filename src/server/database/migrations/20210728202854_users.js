/**
 * 
 * @param {import("knex").Knex} knex 
 */
exports.up = async function(knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments()
    table.string("name").notNullable()
    table.string("email").unique().notNullable()
    table.string("password")
    table.integer("role_id").notNullable()
    table.boolean("is_active").notNullable()
    table.timestamps(true, true)
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable("users")
}
