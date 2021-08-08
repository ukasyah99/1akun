import argon2 from "argon2"
import dayjs from "dayjs"
import { getDatabaseConnection } from "src/server/database"
import { getActivityLogQueue } from "src/server/queue"
import { generateJWT, generateRefreshToken, verifyJWT } from "src/server/lib"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const activityLogQueue = getActivityLogQueue()

  const data = {
    name: req.body.name,
    password: req.body.password,
    is_active: true,
  }

  const payloadData = verifyJWT(req.body.token, "invite")

  // Hash password
  try {
    data.password = await argon2.hash(data.password, { type: argon2.argon2id })
  } catch (error) {
    return res.status(500).json({ error: "Failed to hash password" })
  }

  // Update user data
  let user
  try {
    await db("users").where("id", payloadData.uid).update(data)
    user = await db("users").where("id", payloadData.uid).select(["role_id"]).first()
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user data" })
  }

  // Add to activity log
  activityLogQueue.add({
    user_id: payloadData.uid,
    description: "joined via invite link",
    done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  })

  return res.json({
    access_token: generateJWT({ uid: payloadData.uid, rid: payloadData.rid }, "auth"),
    refresh_token: await generateRefreshToken(payloadData.uid),
  })
}

export default handler
