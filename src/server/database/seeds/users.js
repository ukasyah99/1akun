const argon2 = require("argon2")
const faker = require("faker")

exports.seed = async function (knex) {
  const password = await argon2.hash("rahasia", { type: argon2.argon2id })

  await knex("users").del()
  await knex("users").insert([
    { name: "Administrator", email: "admin@gmail.com", password, role_id: 1, is_active: true },
    { name: "Ukasyah", email: "uka@gmail.com", password, role_id: 2, is_active: true },
  ])
  await knex("users").insert(Array(86).fill(1).map((v) => ({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    role_id: faker.datatype.number({ min: 1, max: 5 }),
    is_active: faker.datatype.boolean(),
  })))
  await knex("users").insert(Array(37).fill(1).map((v) => ({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    role_id: faker.datatype.number({ min: 6, max: 7 }),
    is_active: faker.datatype.boolean(),
  })))
}
