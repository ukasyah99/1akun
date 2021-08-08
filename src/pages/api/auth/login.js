import argon2 from "argon2"
import { getDatabaseConnection } from "src/server/database"
import { generateJWT, generateRefreshToken } from "src/server/lib"

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const data = req.body

  let user
  try {
    user = await db("users")
      .select(["id", "role_id", "password"])
      .where("email", data.email)
      .where("is_active", true)
      .first()
    if (!user) {
      throw new Error("User not found")
    }

    const passwordVerified = await argon2.verify(user.password, data.password, { type: argon2.argon2id })
    if (!passwordVerified) {
      throw new Error("Wrong password")
    }
  } catch (error) {
    return res.status(401).json({ error: "Invalid email or password" })
  }

  res.json({
    access_token: generateJWT({ uid: user.id, rid: user.role_id }, "auth"),
    refresh_token: await generateRefreshToken(user.id),
  })
}

export default handler
