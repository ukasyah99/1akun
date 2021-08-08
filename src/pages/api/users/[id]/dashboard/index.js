import { getDatabaseConnection } from "src/server/database"
import { authorize } from "src/server/middlewares"

const handler = async (req, res) => {
  const db = getDatabaseConnection()

  let result
  try {
    result = await Promise.all([
      await db("users").count().first(),
      await db("roles").count().first(),
      await db("activities").count().where("user_id", req.auth.uid).first(),
      await db("users as u")
        .select("r.name")
        .count("u.id as total")
        .join("roles as r", "r.id", "u.role_id")
        .orderBy("total", "desc")
        .groupBy("role_id")
        .limit(5),
      await db("activities")
        .select(["activities.id", "users.id as user_id", "users.name as user_name", "description", "done_at"])
        .join("users", "users.id", "activities.user_id")
        .orderBy("activities.done_at", "desc")
        .where("user_id", req.auth.uid)
        .limit(4),
    ])
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Failed to get dashboard data" })
  }

  return res.json({
    total_users: result[0]["count(*)"],
    total_roles: result[1]["count(*)"],
    total_activities: result[2]["count(*)"],
    total_users_per_role: result[3],
    latest_activities: result[4],
  })
}

export default authorize(handler)
