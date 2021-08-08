import Queue from "bull"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config"
import { getDatabaseConnection } from "src/server/database"

let activityLogQueue

export const getActivityLogQueue = () => {
  if (!activityLogQueue) {
    try {
      activityLogQueue = new Queue("activity log", {
        redis: {
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
        },
      })

      activityLogQueue.process(function (job) {
        const logActivity = async () => {
          const db = getDatabaseConnection()
          try {
            await db("activities").insert(job.data)
          } catch (error) { }
        }
        return logActivity()
      })
    } catch (error) {
      console.log(error)
    }

    return activityLogQueue
  }
}
