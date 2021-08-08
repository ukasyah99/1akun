import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"

const handler = async (req, res) => {
  const db = getDatabaseConnection()

  if (req.method === "GET") {
    const { page = "1", perPage = "10", search = "", sort } = req.query

    let data
    let total
    try {
      let selectSQL = db("activities")
        .select(["activities.id", "users.id as user_id", "users.name as user_name", "description", "done_at"])
        .join("users", "users.id", "activities.user_id")
      let totalSQL = db("activities").count()

      selectSQL.where("user_id", req.auth.uid)
      totalSQL.where("user_id", req.auth.uid)

      selectSQL.where("description", 'LIKE', `%${search}%`)
      totalSQL.where("description", 'LIKE', `%${search}%`)

      if (sort) {
        selectSQL = selectSQL.orderBy(sort.replace("-", ""), sort.indexOf("-") === 0 ? "desc" : "asc")
      }

      data = await selectSQL
        .limit(perPage)
        .offset((page - 1) * perPage)
      total = (await totalSQL.count().first())["count(*)"]
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Failed to get paginated data" })
    }

    return res.json({ data, total })
  }

  return res.status(400).json({ error: "Invalid request" })
}

export default authorize(handler)
