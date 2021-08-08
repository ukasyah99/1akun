const dayjs = require("dayjs")
const faker = require("faker")

const descriptions = [
  "joined via invite link.",
  "registered him/herself as [Role].",
  "reset his/her password.",
  "updated his/her profile.",
  "invited 14 users as [Role].",
  "create role [Role].",
  "update role [Role].",
  "delete role [Role].",
  "create user [User].",
  "update user [User].",
  "delete user [User].",
]

exports.seed = async function (knex) {
  await knex("activities").del()
  await knex("activities").insert([
    { description: "joined", user_id: 1, done_at: dayjs(faker.date.past(7)).format("YYYY-MM-DD HH:mm:ss") },
    { description: "updated his/her profile", user_id: 1, done_at: dayjs(faker.date.past(7)).format("YYYY-MM-DD HH:mm:ss") },
    { description: "invite 4 users as student", user_id: 1, done_at: dayjs(faker.date.past(7)).format("YYYY-MM-DD HH:mm:ss") },
  ])
  await knex("activities").insert(Array(300).fill(1).map((v) => ({
    description: faker.random.arrayElement(descriptions),
    user_id: faker.datatype.number({ min: 1, max: 113 }),
    done_at: dayjs(faker.date.past(7)).format("YYYY-MM-DD HH:mm:ss"),
  })))
  await knex("activities").insert(Array(250).fill(1).map((v) => ({
    description: faker.random.arrayElement(descriptions),
    user_id: faker.datatype.number({ min: 1, max: 113 }),
    done_at: dayjs(faker.date.past(7)).format("YYYY-MM-DD HH:mm:ss"),
  })))
}
