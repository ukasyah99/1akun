import { getDatabaseConnection } from "src/server/database"
import { generateJWT } from "src/server/lib"
import { cors } from "src/server/middlewares"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const refreshToken = req.body.refresh_token

  let result
  try {
    result = await db("refresh_tokens as rf")
      .select(["u.id as user_id", "u.role_id"])
      .join("users as u", "u.id", "rf.user_id")
      .where("token", refreshToken).first()
    if (!result) {
      throw new Error("Invalid refresh token")
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid refresh token" })
  }

  res.json({
    access_token: generateJWT({ uid: result.user_id, rid: result.role_id }, "auth"),
  })
}

export default cors(handler)
