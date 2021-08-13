import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"
import { getActivityLogQueue } from "src/server/queue"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  if (req.method === "GET") {
    const { page = "1", perPage = "10", search = "", sort, status = "all" } = req.query

    let data
    let total
    try {
      let selectSQL = db("users")
        .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
        .join("roles", "roles.id", "users.role_id")
      let totalSQL = db("users").count()

      selectSQL.where("users.name", 'LIKE', `%${search}%`)
      totalSQL.where("users.name", 'LIKE', `%${search}%`)

      if (status === "active") {
        selectSQL.where("users.is_active", true)
        totalSQL.where("users.is_active", true)
      } else if (status === "inactive") {
        selectSQL.whereNot("users.is_active", true)
        totalSQL.whereNot("users.is_active", true)
      }

      if (sort) {
        selectSQL = selectSQL.orderBy(sort.replace("-", ""), sort.indexOf("-") === 0 ? "desc" : "asc")
      }

      data = await selectSQL
        .limit(perPage)
        .offset((page - 1) * perPage)
      total = (await totalSQL.count().first())["count(*)"]
    } catch (error) {
      return res.status(500).json({ error: "Failed to get paginated data" })
    }

    return res.json({ data, total })
  }

  if (req.method === "POST") {
    let data
    try {
      const [insertID] = await db("users").insert(req.body)
      data = await db("users")
        .select(["users.id", "users.name", "email", "roles.id as role_id", "roles.name as role_name", "is_active", "created_at", "updated_at"])
        .join("roles", "roles.id", "users.role_id")
        .where("users.id", insertID).first()
    } catch (error) {
      return res.status(500).json({ error: "Failed to create data" })
    }

    // Add to activity log
    try {
      activityLogQueue.add("create-user", {
        user_id: req.auth.uid,
        description: `create user ${req.body.name}`,
        done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
    } catch (error) { }

    return res.json(data)
  }

  return res.status(400).json({ error: "Invalid request." })
}

export default authorize(handler, ({ rid }) => rid === 1)
