import smtpTransport from 'nodemailer-smtp-transport'
import nodemailer from 'nodemailer'
import { IUser } from '../interfaces/IUser'
export default class MailService {
  private emailTransport = nodemailer.createTransport(
    smtpTransport({
      service: 'Hotmail',
      auth: {
        user: process.env.WAVY_EMAIL,
        pass: process.env.WAVY_PASS,
      },
    })
  )

  public confirmationEmail(
    user: IUser,
    token: string,
    host: string,
    newTokenCreated: boolean
  ) {
    return new Promise((resolve, reject) => {
      const emailConfirmationLink = 'http://' + host + '/verify?id=' + token
      const mailOptions = {
        from: process.env.WAVY_EMAIL,
        to: user.email,
        subject: 'Please activate your account',
        html: newTokenCreated
          ? '<html><body>Hello, it seems your token was renewed<br> Please Click on the link to start your account before your details are deleted.<br><a href='
              .concat(emailConfirmationLink)
              .concat('>Click here to verify</a></body></html>')
          : '<html><body>Hello,<br> Please Click on the link to verify your email.<br><a href='
              .concat(emailConfirmationLink)
              .concat('>Click here to verify</a></body></html>'),
      }
      this.emailTransport.sendMail(mailOptions, (err, data) => {
        if (err) return reject({ code: 500, msg: err.message })
        else {
          return resolve(data)
        }
      })
    })
  }
}

