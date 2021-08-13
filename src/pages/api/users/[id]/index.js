import argon2 from "argon2"
import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"
import { getActivityLogQueue } from "src/server/queue"

const handler = async (req, res) => {
  const { id } = req.query

  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  if (req.method === "GET") {
    // Check permission
    if (req.auth.rid !== id && req.auth.rid !== 1) {
      return res.status(403).json({ error: "You are not permitted to access this." })
    }

    let data
    try {
      data = await db("users")
        .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
        .join("roles", "roles.id", "users.role_id")
        .where("users.id", id).first()
    } catch (error) {
      return res.status(500).json({ error: "Failed to get data" })
    }

    return res.json(data)
  }

  if (req.method === "PUT") {
    // Check permission
    if (req.auth.rid !== id && req.auth.rid !== 1) {
      return res.status(403).json({ error: "You are not permitted to access this." })
    }

    // Check if email already used by other user
    try {
      const result = await db("users").where("email", req.body.email).whereNot("id", id).first()
      if (result) throw new Error("Email already used")
    } catch (error) {
      return res.status(400).json({ error: "Email already used by another user." })
    }

    const data = {
      name: req.body.name,
      email: req.body.email,
      role_id: req.body.role_id,
      is_active: req.body.is_active,
    }

    if (req.body.password) {
      data.password = await argon2.hash(req.body.password, { type: argon2.argon2id })
    }

    let result
    try {
      await db("users").where("id", id).update(data)
      result = await db("users")
        .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
        .join("roles", "roles.id", "users.role_id")
        .where("users.id", id).first()
      if (!result) throw new Error("Data not found")
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Failed to update data" })
    }

    try {
      // Current user updated his own profile
      if (req.userID === id) {
        activityLogQueue.add("update-user", {
          user_id: req.auth.uid,
          description: "updated his/her profile",
          done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        })
      } else {
        activityLogQueue.add("update-user", {
          user_id: req.auth.uid,
          description: `updated user ${data.name}`,
          done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        })
      }
    } catch (error) { }

    return res.json(result)
  }

  if (req.method === "DELETE") {
    // Check permission
    if (req.auth.rid !== 1) {
      return res.status(403).json({ error: "You are not permitted to access this." })
    }

    let data
    try {
      data = await db("users")
        .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
        .join("roles", "roles.id", "users.role_id")
        .where("users.id", id).first()
      if (!data) throw new Error("Data not found")
      await db("users").where("id", id).del()
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Failed to delete data" })
    }

    try {
      activityLogQueue.add("delete-user", {
        user_id: req.auth.uid,
        description: `deleted user ${data.name}`,
      })
    } catch (error) { }

    return res.json(data)
  }

  return res.status(400).json({ error: "Invalid request." })
}

export default authorize(handler)
