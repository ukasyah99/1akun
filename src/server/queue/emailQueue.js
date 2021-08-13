import { Queue, Worker } from "bullmq"
import nodemailer from "nodemailer"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config"
import { getEmailTransporter } from "src/server/email"

let emailQueue

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email-sending", {
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
      },
    })

    const worker = new Worker("email-sending", async job => {
      const transporter = await getEmailTransporter()
      const info = await transporter.sendMail(job.data)
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    })

    worker.on('completed', (job) => {
      console.log(`${job.id} has completed!`)
    })

    worker.on('failed', (job, err) => {
      console.log(`${job.id} has failed with ${err.message}`)
    })
  }

  return emailQueue
}
