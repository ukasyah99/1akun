import argon2 from "argon2"
import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { getActivityLogQueue } from "src/server/queue"
import { verifyJWT } from "src/server/lib/token"

const handler = async (req, res) => {
  const activityLogQueue = getActivityLogQueue()
  const db = getDatabaseConnection()
  const data = req.body

  const payloadData = verifyJWT(accessToken, "reset password")
  if (!payloadData) {
    return res.status(400).json({ error: "This process aborted due to invalid token." })
  }

  try {
    const password = await argon2.hash(data.password, { type: argon2.argon2id })
    await db("users").where("id", payload.uid).update({ password })
  } catch (error) {
    return res.status(500).json({ error: "Failed to update password" })
  }

  // Add to activity log
  activityLogQueue.add({
    user_id: payload.uid,
    description: "reset his/her password",
    done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  })

  res.json({ message: "Password updated" })
}

export default handler
