const transporter = require('../config/email')
const path = require('path')

const isSmtpConfigured = () => {
  return (
    process.env.SMTP_USER &&
    !process.env.SMTP_USER.includes('your_email') &&
    process.env.SMTP_PASSWORD &&
    !process.env.SMTP_PASSWORD.includes('your_app_password')
  )
}

const sendInterviewScheduledEmail = async (
  candidateEmail,
  candidateName,
  recruiterEmail,
  recruiterName,
  interviewDate,
  meetLink,
) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Interview invitation email skipped for:', candidateEmail)
      return
    }

    const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const recruiterDisplay = recruiterName
      ? `${recruiterName}${recruiterEmail ? ` (${recruiterEmail})` : ''}`
      : recruiterEmail || 'Assigned Recruiter'

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: candidateEmail,
      cc: recruiterEmail || undefined,
      subject: '🗓️ Interview Scheduled - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Consultancy Management Portal</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f172a; margin-top: 0;">Interview Invitation</h2>
            <p style="color: #334155; font-size: 15px;">Dear <strong>${candidateName}</strong>,</p>
            <p style="color: #334155; font-size: 15px;">We are pleased to inform you that your interview has been scheduled with Aston Recruitment.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0284c7; font-size: 16px;">Interview Details:</h3>
              <p style="margin: 8px 0; color: #334155;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0; color: #334155;"><strong>Assigned Recruiter:</strong> ${recruiterDisplay}</p>
              <p style="margin: 8px 0; color: #334155;"><strong>Platform:</strong> Google Meet (Video Call)</p>
              <p style="margin: 12px 0 0 0;">
                <strong>Google Meet Link:</strong><br/>
                <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 6px;">Join Google Meet Interview</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Direct link: <a href="${meetLink}" style="color: #0284c7;">${meetLink}</a></p>
            </div>

            <h4 style="color: #0f172a; margin-bottom: 8px;">Important Guidelines:</h4>
            <ul style="color: #475569; font-size: 14px; padding-left: 20px; line-height: 1.6;">
              <li>Please click the Google Meet link at least 5 minutes before the scheduled time.</li>
              <li>Ensure your webcam, microphone, and internet connection are tested beforehand.</li>
              <li>Keep an updated copy of your resume and qualifications ready.</li>
            </ul>

            <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you have any questions, need to reschedule, or experience any issues, please reply to this email, contact your recruiter, or reach out to support at <a href="mailto:Contact@astonrecruitment.in" style="color: #0284c7;">Contact@astonrecruitment.in</a>.</p>
            <p style="color: #0f172a; font-weight: bold; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Interview scheduled email sent successfully to ${candidateEmail}`)
  } catch (error) {
    console.error('Error sending interview email:', error)
    throw error
  }
}

const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Reset password link skipped for:', email)
      return
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: email,
      subject: 'Reset Your Password - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #0066cc;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            <p><a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p style="color: #666666; font-size: 13px; margin-top: 20px;">If you experience any issues, please contact support at <a href="mailto:Contact@astonrecruitment.in" style="color: #0066cc;">Contact@astonrecruitment.in</a>.</p>
            <p>Best regards,<br/>Aston Recruitment Team</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Reset password email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

const sendOtpEmail = async (email, otp) => {
  try {
    console.log(`🔑 [OTP GENERATED] for ${email}: ${otp}`)

    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP is not configured. OTP printed above for testing.')
      return
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: email,
      subject: 'Phone Verification OTP - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #0066cc;">Phone Verification</h2>
            <p>Your One-Time Password (OTP) for phone verification is:</p>
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>Do not share this OTP with anyone. Aston Recruitment team will never ask for your OTP.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p style="color: #666666; font-size: 13px; margin-top: 20px;">If you experience any issues, please contact support at <a href="mailto:Contact@astonrecruitment.in" style="color: #0066cc;">Contact@astonrecruitment.in</a>.</p>
            <p>Best regards,<br/>Aston Recruitment Team</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('OTP email sent successfully')
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw error
  }
}

module.exports = { sendInterviewScheduledEmail, sendResetPasswordEmail, sendOtpEmail }
