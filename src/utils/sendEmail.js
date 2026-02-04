import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || `"UEPMRMP" <${process.env.EMAIL_USER}>`

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  })

  console.log('Correo enviado a:', to, 'Asunto:', subject)
}

export default sendEmail