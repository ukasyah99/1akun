import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { getActivityLogQueue } from "src/server/queue"
import { verifyJWT } from "src/server/lib/token"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  // Check if token is valid
  const payloadData = verifyJWT(req.body.token, "verify email")
  if (!payloadData) {
    return res.status(400).json({ error: "Invalid token." })
  }

  // Activate user
  try {
    await db("users").where("id", payloadData.uid).update({ is_active: true })
  } catch (error) {
    return res.status(500).json({ error: "Failed to activate user" })
  }

  // Add to activity log
  try {
    const user = await db("users")
      .select(["roles.name as role_name"])
      .join("roles", "roles.id", "users.role_id")
      .where("users.id", payload.uid).first()
    if (!user) throw new Error("User not found")
    activityLogQueue.add("verify-email", {
      user_id: payload.uid,
      description: `registered him/herself as ${user.role_name}`,
      done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    })
  } catch (error) {}

  res.json({
    access_token: generateJWT({ uid: user.id, rid: user.role_id }, "auth"),
    refresh_token: await generateRefreshToken(user.id),
  })
}

export default handler
