import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"
import { getActivityLogQueue } from "src/server/queue"

const handler = async (req, res) => {
  const { id } = req.query

  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  if (req.method === "GET") {
    let data
    try {
      data = await db("roles").select("*").where("id", id).first()
    } catch (error) {
      return res.status(500).json({ error: "Failed to get data" })
    }

    return res.json(data)
  }

  if (req.method === "PUT") {
    let data
    try {
      await db("roles").where("id", id).update(req.body)
      data = await db("roles").select("*").where("id", id).first()
      if (!data) throw new Error("Data not found")
    } catch (error) {
      return res.status(500).json({ error: "Failed to update data" })
    }

    // Add to activity log
    try {
      activityLogQueue.add("update-role", {
        user_id: req.auth.uid,
        description: `updated role ${req.body.name}`,
        done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
    } catch (error) { }

    return res.json(data)
  }

  if (req.method === "DELETE") {
    let data
    try {
      data = await db("roles").select("*").where("id", id).first()
      if (!data) throw new Error("Data not found")
      await db("roles").where("id", id).del()
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete data" })
    }

    try {
      activityLogQueue.add("delete-role", {
        user_id: req.auth.uid,
        description: `deleted role ${data.name}`,
      })
    } catch (error) { }

    return res.json(data)
  }

  return res.status(400).json({ error: "Invalid request" })
}

export default authorize(handler, ({ rid }) => rid === 1)
