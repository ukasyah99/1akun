import { getDatabaseConnection } from "src/server/database"
import { getEmailQueue } from "src/server/queue"
import { generateJWT } from "src/server/lib"
import { BASE_URL } from "src/config"

const getEmailHtml = (token) => {
  const link = `${BASE_URL}/auth/verify-email?token=${token}`
  return `\
  <p>
    You need to verify your email address to complete the registration process. Please click the link below:
  </p>
  <p>
    <a href="${link}" target="_blank">
      ${link}
    </a>
  </p>
  `
}

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const emailQueue = getEmailQueue()
  const data = { ...req.body, is_active: false }

  // Check if password and password_repeat matched
  if (data.password !== data.password_repeat) {
    return res.status(400).json({ error: "Both passwords don't match" })
  }

  // Check if current role is opening registration
  try {
    const role = await db("roles").where("id", data.role_id).first()
    if (!role) throw new Error("Role not found")
    if (!role.is_opening_registration) throw new Error("Registration is not open")
  } catch (error) {
    return res.status(400).json({ error: "Cannot register using current role" })
  }

  // Save new user data
  let userID
  try {
    const [insertID] = await db("users").insert({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    userID = insertID
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Failed to save user data" })
  }

  const token = generateJWT({ uid: userID }, "verify email", 30 * 60)

  emailQueue.add({
    from: "system@user-manager.com",
    to: data.email,
    subject: "Verify your email address",
    html: getEmailHtml(token),
  })

  return res.json({ message: "Link has been sent. Check your inbox." })
}

export default handler
