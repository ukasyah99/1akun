import nodemailer from "nodemailer"

let transporter

export const getEmailTransporter = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  return transporter
}
