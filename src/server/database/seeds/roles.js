const faker = require("faker")

const data = Array(5).fill(1).map((v) => ({
  name: faker.name.jobTitle(),
  is_opening_registration: faker.datatype.boolean(),
}))

exports.seed = async function (knex) {
  await knex("roles").del()
  await knex("roles").insert([
    { name: "Superuser", is_opening_registration: false },
    { name: "Member", is_opening_registration: true },
    ...data,
  ])
}
