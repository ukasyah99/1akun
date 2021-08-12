import { getDatabaseConnection } from "src/server/database"
import { authorize, cors } from "src/server/middlewares"

const handler = async (req, res) => {
  const db = getDatabaseConnection()

  try {
    await db("refresh_tokens").where("user_id", req.userID).del()
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete refresh token" })
  }
  
  return res.json({ message: "OK" })
}

export default cors(authorize(handler))
