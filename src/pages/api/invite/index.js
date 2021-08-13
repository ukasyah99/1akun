import dayjs from "dayjs"
import { BASE_URL } from "src/config"
import { getDatabaseConnection } from "src/server/database"
import { getActivityLogQueue, getEmailQueue } from "src/server/queue"
import { generateJWT } from "src/server/lib"
import { authorize } from "src/server/middlewares"

const getEmailHtml = (token) => {
  const link = `${BASE_URL}/auth/confirm-invitation?token=${token}`
  return `\
  <p>
    You need to complete some data in order to start joining.
    Please click the link below:
  </p>
  <p>
    <a href="${link}" target="_blank">
      ${link}
    </a>
  </p>
  <p>
    Please note that the link is valid for 1 week.
    If you think this is a mistake, simply ignore this message.
  </p>
  `
}

const handler = async (req, res) => {
  const db = getDatabaseConnection()
  const emailQueue = getEmailQueue()
  const activityLogQueue = getActivityLogQueue()

  const data = {
    role_id: req.body.role_id,
    emails: req.body.emails,
  }

  let role
  try {
    role = await db("roles").where("id", data.role_id).first()
    if (!role) throw new Error("Role not found")
  } catch (error) {
    return res.status(400).json({ error: "Role not found." })
  }

  let result
  try {
    const promises = data.emails.map(email => db("users").insert({
      name: email,
      email: email,
      is_active: false,
      role_id: data.role_id,
    }))
    result = await Promise.all(promises)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Failed to save users' data." })
  }

  const userIDs = result.map(item => item[0])

  try {
    for (let i = 0; i < userIDs.length; i++) {
      const token = generateJWT({ uid: userIDs[i], rid: data.role_id }, "invite", 7 * 24 * 60 * 60)
      emailQueue.add({
        from: "1akun@mycompany.com",
        to: data.emails[i],
        subject: `You are invited to join as a ${role.name} at MyCompany`,
        html: getEmailHtml(token),
      })
    }
  } catch (error) { }

  try {
    activityLogQueue.add("invite", {
      user_id: req.auth.uid,
      description: `invited ${userIDs.length} users as ${role.name}`,
      done_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    })
  } catch (error) { }

  return res.json({ message: "All users have been invited." })
}

export default authorize(handler, ({ rid }) => rid === 1)
