import { Queue, Worker } from "bullmq"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config"
import { getDatabaseConnection } from "src/server/database"

let activityLogQueue

export const getActivityLogQueue = () => {
  if (!activityLogQueue) {
    activityLogQueue = new Queue("activity-log", {
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
      },
    })

    const worker = new Worker("activity-log", async job => {
      const db = getDatabaseConnection()
      await db("activities").insert(job.data)
    })
  }

  return activityLogQueue
}
