import { BASE_URL } from "src/config"
import { getDatabaseConnection } from "src/server/database"
import { generateJWT } from "src/server/lib"
import { getEmailQueue } from "src/server/queue"

const getEmailHtml = (token) => {
  const link = `${BASE_URL}/auth/reset-password?token=${token}`
  return `\
  <p>
    We received a request to reset your account password. Please click the link below:
  </p>
  <p>
    <a href="${link}" target="_blank">
      ${link}
    </a>
  </p>
  <p>
    If you don't think you've sent a request to reset your password, simply ignore this message.
  </p>
  `
}

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const emailQueue = getEmailQueue()
  const data = req.body

  let user
  try {
    user = await db("users").select(["id"]).where("email", data.email).first()
    if (!user) {
      throw new Error("Email not found")
    }
  } catch (error) {
    return res.status(401).json({ error: "Email not found" })
  }

  const token = generateJWT({ uid: user.id }, "reset password")

  try {
    emailQueue.add("forgot-password", {
      from: "system@user-manager.com",
      to: data.email,
      subject: "Reset password request",
      html: getEmailHtml(token),
    })
  } catch (error) { }

  res.json({ message: "Link has been sent. Check your inbox." })
}

export default handler
