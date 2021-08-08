/**
 * 
 * @param {import("knex").Knex} knex 
 */
 exports.up = async function (knex) {
  await knex.schema.createTable("activities", (table) => {
    table.bigIncrements()
    table.string("description").notNullable()
    table.integer("user_id").notNullable()
    table.timestamp("done_at").notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable("activities")
}
