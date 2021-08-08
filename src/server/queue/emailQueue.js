import Queue from "bull"
import nodemailer from "nodemailer"
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "src/config"
import { getEmailTransporter } from "src/server/email"

let emailQueue

export const getEmailQueue = () => {
  if (!emailQueue) {
    try {
      emailQueue = new Queue("email sending", {
        redis: {
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
        },
      })
      
      emailQueue.process(function (job) {
        const sendEmail = async () => {
          const transporter = await getEmailTransporter()
  
          let info
          try {
            info = await transporter.sendMail(job.data)
          } catch (error) {
            console.log(error)
          }
  
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
        }
      
        return sendEmail()
      })
    } catch (error) {
      console.log(error)
    }
  }


  return emailQueue
}
