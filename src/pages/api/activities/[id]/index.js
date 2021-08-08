import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"

const handler = async (req, res) => {
  const { id } = req.query

  const db = getDatabaseConnection()

  if (req.method === "GET") {
    let data
    try {
      data = await db("activities")
        .select(["activities.id", "users.id as user_id", "users.name as user_name", "description", "done_at"])
        .join("users", "users.id", "activities.user_id")
        .where("activities.id", id).first()
    } catch (error) {
      return res.status(500).json({ error: "Failed to get data" })
    }

    return res.json(data)
  }

  return res.status(400).json({ error: "Invalid request" })
}

export default authorize(handler, ({ rid }) => rid === 1)
