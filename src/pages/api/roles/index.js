import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"
import { getActivityLogQueue } from "src/server/queue"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  if (req.method === "GET") {
    const { page = "1", perPage = "10", search = "", sort, registration = "all" } = req.query

    let data
    let total
    try {
      let selectSQL = db("roles").select("*")
      let totalSQL = db("roles").count()

      selectSQL.where("name", 'LIKE', `%${search}%`)
      totalSQL.where("name", 'LIKE', `%${search}%`)

      if (registration === "open") {
        selectSQL.where("is_opening_registration", true)
        totalSQL.where("is_opening_registration", true)
      } else if (registration === "closed") {
        selectSQL.whereNot("is_opening_registration", true)
        totalSQL.whereNot("is_opening_registration", true)
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
      const [insertID] = await db("roles").insert(req.body)
      data = await db("roles").select("*").where("id", insertID).first()
    } catch (error) {
      return res.status(500).json({ error: "Failed to create data" })
    }

    // Add to activity log
    activityLogQueue.add({
      user_id: req.auth.uid,
      description: `created role ${req.body.name}`,
      done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    })

    return res.json(data)
  }

  return res.status(400).json({ error: "Invalid request" })
}

export default authorize(handler, ({ rid }) => rid === 1)
