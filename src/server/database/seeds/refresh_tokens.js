const { nanoid } = require("nanoid")

exports.seed = async function (knex) {
  await knex("refresh_tokens").del()
  await knex("refresh_tokens").insert([
    { token: nanoid(32), user_id: 1 },
  ])
}
