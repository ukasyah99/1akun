import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"

const handler = async (req, res) => {
  const db = getDatabaseConnection()

  let user
  try {
    user = await db("users")
      .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
      .join("roles", "roles.id", "users.role_id")
      .where("users.id", req.auth.uid).first()
    if (!user) {
      throw new Error("Not found")
    }
  } catch (error) {
    return res.status(404).json({ error: "User not found" })
  }

  user.password = undefined
  return res.json(user)
}

export default authorize(handler)
