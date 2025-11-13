import nodemailer from 'nodemailer'
import { User } from '~~/shared/types/models/user'
import { newToken } from '../repositories/token'
import { ok, Result } from '~~/shared/utils/error/result'
import { internalError } from '~~/shared/utils/error/error'
import { logError } from '~~/shared/utils/log/log'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { log } from 'console'

const appName = process.env.APP_NAME ?? 'My App'
const appUrl = process.env.APP_URL ?? 'http://localhost:3000'

const host: string = process.env.MAIL_HOST ?? 'localhost'
const port: number = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587
const secure: boolean = process.env.MAIL_SECURE === 'true'
const auth: { user: string; pass: string } = {
  user: process.env.MAIL_USER ?? 'donbarrigon',
  pass: process.env.MAIL_PASS ?? '1234567890',
}
const fromName: string = process.env.MAIL_FROM_NAME ?? 'Don Barrigon'
const fromEmail: string = process.env.MAIL_FROM ?? 'donbarrigon@gamail.com'
const from: string = `${fromName} <${fromEmail}>`

export async function sendEmail(
  to: string[],
  subject: string,
  body: string
): Promise<Result<SMTPTransport.SentMessageInfo>> {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure, // true for 465, false for other ports
    auth: auth,
  })
  const maxAttempts = 3
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      const info = await transporter.sendMail({
        from: from,
        to,
        subject,
        html: body,
      })
      return ok(info)
    } catch (e) {
      attempt++
      logError(
        {
          message: 'Hubo un problema al enviar el correo',
          to: to,
          subject: subject,
        },
        e
      )
      if (attempt < maxAttempts) {
        const delay = 5000 * attempt // 5s, 10s, 15s
        await new Promise(r => setTimeout(r, delay))
      } else {
        return internalError(e, 'Hubo un problema al enviar el correo')
      }
    }
  }
  return internalError('Hubo un problema al enviar el correo')
}

export async function sendEmailVerfification(user: User) {
  const token = await newToken(user._id!, 'email-verification')
  if (token.error) {
    await logError('No se pudo crear el token change-email-revert', token.error)
    return
  }
  const url = `${appUrl}/users/verify-email?u=${user._id?.toHexString()}&t=${token.value.token}`
  const to = [user.email]
  const subject = 'Confirma tu cuenta en ' + appName

  const body = `
<h1>Bienvenido a ${appName}</h1>
<p>Gracias por registrarte. Para completar tu registro, haz clic en el siguiente enlace:</p>
<p>
    <a href="${url}" 
        style="display:inline-block;padding:10px 20px;background:#0069d9;color:#fff;
              text-decoration:none;border-radius:5px;">
        Confirmar mi correo
    </a>
</p>
<p>Si no fuiste tú quien se registró, puedes ignorar este mensaje.</p>
<p>Si no puedes hacer clic, copia y pega este enlace en tu navegador:</p>
<p>${url}</p>
<br>
<p>Equipo de ${appName}</p>
`

  await sendEmail(to, subject, body)
}

export async function sendEmailChangeRevert(user: User, oldEmail: string) {
  const token = await newToken(user._id!, 'change-email-revert', { oldEmail, newEmail: user.email })
  if (token.error) {
    await logError('No se pudo crear el token change-email-revert', token.error)
    return
  }
  const url = `${appUrl}/users/change-email-revert?u=${user._id?.toHexString()}&t=${token.value.token}`
  const to = [oldEmail]
  const subject = 'Su correo en ' + appName + ' ha sido actualizado'
  const body = `
<h1>Hola de nuevo en ${appName}</h1>
<p>Queremos informarte que su dirección de correo fue actualizada recientemente.</p>
<p>Nuevo correo: <strong>${user.email}</strong></p>
<p>Si realizaste este cambio, no necesitas hacer nada.</p>
<p>Pero si <strong>NO fuiste tú</strong>, puedes revertir el cambio haciendo clic en el siguiente enlace:</p>
<p>
    <a href="${url}" 
        style="display:inline-block;padding:10px 20px;background:#dc3545;color:#fff;
              text-decoration:none;border-radius:5px;">
        Revertir cambio de correo
    </a>
</p>
<p>Si no puedes hacer clic, copia y pega este enlace en tu navegador:</p>
<p>${url}</p>
<br>
<p>Equipo de ${appName}</p>
`

  await sendEmail(to, subject, body)
}

export async function sendEmailForgotPassword(user: User) {
  const token = await newToken(user._id!, 'reset-password')
  if (token.error) {
    await logError('No se pudo crear el token reset-password', token.error)
    return
  }
  const url = `${appUrl}/users/reset-password?u=${user._id?.toHexString()}&t=${token.value.token}`
  const to = [user.email]
  const subject = 'Restablece tu contraseña en ' + appName

  const body = `
<h1>Hola ${user.profile.nickname}</h1>
<p>Recibimos una solicitud para restablecer tu contraseña en ${appName}.</p>
<p>Se creara una nueva contraseña haciendo clic en el siguiente enlace:</p>
<p>
    <a href="${url}" 
        style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;
              text-decoration:none;border-radius:5px;">
        Restablecer contraseña
    </a>
</p>
<p>Si no solicitaste este cambio, por favor restablece tu contraseña inmediatamente o contacta a nuestro soporte.</p>
<p>Si no puedes hacer clic, copia y pega este enlace en tu navegador:</p>
<p>${url}</p>
<br>
<p>Equipo de ${appName}</p>
    `

  await sendEmail(to, subject, body)
}

export async function sendEmailNewPassword(user: User, newPassword: string) {
  const token = await newToken(user._id!, 'reset-password')
  if (token.error) {
    await logError('No se pudo crear el token reset-password', token.error)
    return
  }
  const to = [user.email]
  const subject = 'Tu nueva contraseña en ' + appName

  const body = `
    <h1>Hola ${user.profile.nickname}</h1>
    <p>Queremos informarte que tu contraseña ha sido restablecida.</p>
    <p>Tu nueva contraseña es:</p>
    <p style="font-size:18px;font-weight:bold;background:#f8f9fa;
              border:1px solid #ddd;padding:10px;border-radius:5px;">
        ${newPassword}
    </p>
    <p>Por tu seguridad, te recomendamos cambiarla después de iniciar sesión.</p>
    <p>Si no solicitaste este cambio, por favor contacta con nuestro soporte de inmediato.</p>
    <br>
    <p>Equipo de ${appName}</p>
`

  await sendEmail(to, subject, body)
}
