const transporter = require('../config/email')
const path = require('path')

const sendInterviewScheduledEmail = async (
  candidateEmail,
  candidateName,
  recruiterEmail,
  interviewDate,
  meetLink,
) => {
  try {
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'admin@kaamsekaaam.com',
      to: candidateEmail,
      cc: recruiterEmail,
      subject: 'Interview Scheduled - kaamSeKaam',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #0066cc;">Interview Scheduled</h2>
            <p>Dear ${candidateName},</p>
            <p>We are pleased to inform you that your interview has been scheduled with us.</p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Interview Date & Time:</strong> ${new Date(interviewDate).toLocaleString()}</p>
              <p><strong>Google Meet Link:</strong> <a href="${meetLink}" style="color: #0066cc;">${meetLink}</a></p>
            </div>
            <p>Please join the meeting at least 5 minutes before the scheduled time.</p>
            <p>If you have any questions, please contact our recruiter.</p>
            <p>Best regards,<br/>kaamSeKaam Team</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Interview scheduled email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'admin@kaamsekaaam.com',
      to: email,
      subject: 'Reset Your Password - kaamSeKaam',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #0066cc;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            <p><a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>kaamSeKaam Team</p>
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

module.exports = { sendInterviewScheduledEmail, sendResetPasswordEmail }
