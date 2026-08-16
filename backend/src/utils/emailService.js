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
  durationMinutes = 60,
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

    // Generate .ics calendar content
    const dateObj = new Date(interviewDate)
    const formattedStart = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "")
    const endDateObj = new Date(dateObj.getTime() + durationMinutes * 60 * 1000)
    const formattedEnd = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "")

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `URL:${meetLink || ''}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      'SUMMARY:Interview with Aston Recruitment',
      `DESCRIPTION:Interview with recruiter ${recruiterName || 'Aston Recruiter'}. Join Room: ${meetLink || ''}`,
      'LOCATION:Online',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

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
            
            <div style="background-color: #f8fafc; border-left: 4px solid #b88f3f; padding: 16px; border-radius: 4px; margin: 20px 0;">
               <h3 style="margin-top: 0; color: #b88f3f; font-size: 16px;">Interview Details:</h3>
               <p style="margin: 8px 0; color: #334155;"><strong>Date & Time:</strong> ${formattedDate}</p>
               <p style="margin: 8px 0; color: #334155;"><strong>Duration:</strong> ${durationMinutes} Minutes (${durationMinutes >= 60 ? `${(durationMinutes / 60).toFixed(1)} hour(s)` : 'half-hour'})</p>
               <p style="margin: 8px 0; color: #334155;"><strong>Assigned Recruiter:</strong> ${recruiterDisplay}</p>
               <p style="margin: 8px 0; color: #334155;"><strong>Platform:</strong> Aston Meeting Room (Online Video Call)</p>
               <p style="margin: 12px 0 0 0;">
                 <strong>Meeting Link:</strong><br/>
                 <a href="${meetLink}" target="_blank" style="display: inline-block; background-color: #b88f3f; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 6px;">Join Interview Room</a>
               </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Direct link: <a href="${meetLink}" style="color: #b88f3f;">${meetLink}</a></p>
            </div>

            <h4 style="color: #0f172a; margin-bottom: 8px;">Important Guidelines:</h4>
            <ul style="color: #475569; font-size: 14px; padding-left: 20px; line-height: 1.6;">
              <li>Please click the interview room link at least 5 minutes before the scheduled time.</li>
              <li>Ensure your webcam, microphone, and internet connection are tested beforehand.</li>
              <li>Keep an updated copy of your resume and qualifications ready.</li>
            </ul>

            <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you have any questions, need to reschedule, or experience any issues, please reply to this email, contact your recruiter, or reach out to support at <a href="mailto:Contact@astonrecruitment.in" style="color: #b88f3f;">Contact@astonrecruitment.in</a>.</p>
            <p style="color: #0f172a; font-weight: bold; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'invite.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        }
      ]
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

const sendRegistrationSuccessEmail = async (email, name) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Welcome email skipped for:', email)
      return
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: email,
      subject: '🎉 Welcome to Aston Recruitment!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Consultancy Management Portal</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f172a; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #334155; font-size: 15px;">Dear <strong>${name}</strong>,</p>
            <p style="color: #334155; font-size: 15px;">Thank you for registering on the Aston Recruitment portal. Your account has been successfully created!</p>
            <p style="color: #334155; font-size: 15px;">Our recruitment team will review your profile and match you with potential jobs that fit your skillset.</p>
            
            <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you experience any issues or have questions, please contact support at <a href="mailto:Contact@astonrecruitment.in" style="color: #0066cc;">Contact@astonrecruitment.in</a>.</p>
            <p style="color: #0f172a; font-weight: bold; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent successfully to ${email}`)
  } catch (error) {
    console.error('Error sending registration email:', error)
    throw error
  }
}

const sendSelectionEmail = async (candidateEmail, candidateName) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Selection email skipped for:', candidateEmail)
      return
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: candidateEmail,
      subject: '🎉 Congratulations! You are Selected - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #10b981; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 14px;">Application Status Update</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #065f46; margin-top: 0;">Congratulations, ${candidateName}!</h2>
            <p style="color: #334155; font-size: 15px;">Dear <strong>${candidateName}</strong>,</p>
            <p style="color: #334155; font-size: 15px;">We are thrilled to inform you that you have been <strong>Selected</strong> for the role you interviewed for through Aston Recruitment!</p>
            <p style="color: #334155; font-size: 15px;">Our onboarding team will contact you shortly with information regarding the next steps, contract details, and orientation schedules.</p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                <strong>Action Required:</strong> Please make sure your latest resume PDF is uploaded to the portal for onboarding records:<br/>
                👉 <strong>Path to update in portal:</strong> Log in to your dashboard, click <strong>Edit Profile</strong>, and upload your resume PDF in the <strong>Upload Resume PDF</strong> section.
              </p>
            </div>

            <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you have any questions in the meantime, please contact support at <a href="mailto:Contact@astonrecruitment.in" style="color: #10b981;">Contact@astonrecruitment.in</a>.</p>
            <p style="color: #0f172a; font-weight: bold; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Selection email sent successfully to ${candidateEmail}`)
  } catch (error) {
    console.error('Error sending selection email:', error)
  }
}

const sendRejectionEmail = async (candidateEmail, candidateName, rejectionReason) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Rejection email skipped for:', candidateEmail)
      return
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: candidateEmail,
      subject: 'Update on your job application - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #ef4444; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #fee2e2; font-size: 14px;">Application Status Update</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #991b1b; margin-top: 0;">Hello ${candidateName},</h2>
            <p style="color: #334155; font-size: 15px;">Thank you for taking the time to meet with us and participate in our selection process.</p>
            <p style="color: #334155; font-size: 15px;">After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0;">
               <h3 style="margin-top: 0; color: #991b1b; font-size: 14px;">Feedback:</h3>
               <p style="margin: 8px 0; color: #334155; font-size: 14px;">${rejectionReason || 'No feedback comments provided.'}</p>
            </div>
            
            <p style="color: #334155; font-size: 15px;">We appreciate your interest in Aston Recruitment client mandates and wish you the best in your career search.</p>
            
            <p style="color: #475569; font-size: 14px; margin-top: 24px;">If you have any questions, please contact support at <a href="mailto:Contact@astonrecruitment.in" style="color: #ef4444;">Contact@astonrecruitment.in</a>.</p>
            <p style="color: #0f172a; font-weight: bold; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Rejection email sent successfully to ${candidateEmail}`)
  } catch (error) {
    console.error('Error sending rejection email:', error)
  }
}

const sendSentToClientEmailToClient = async (clientEmail, clientName, candidateName, resumePath) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Client intro email skipped for:', clientEmail)
      return
    }

    const resumeLink = resumePath ? `http://localhost:5001/${resumePath}` : null;
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: clientEmail,
      subject: `Aston Recruitment - Candidate Profile: ${candidateName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Consultancy & Client Referral Portal</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f172a; margin-top: 0;">Hello ${clientName},</h2>
            <p style="color: #334155; font-size: 15px;">Aston Recruitment is pleased to refer candidate <strong>${candidateName}</strong> for your active openings.</p>
            <p style="color: #334155; font-size: 15px;">We have conducted preliminary rounds of interviews and technical screening. Below is the candidate's professional resume for your evaluation.</p>
            
            ${resumeLink ? `
              <div style="margin: 24px 0; text-align: center;">
                <a href="${resumeLink}" target="_blank" style="display: inline-block; background-color: #b88f3f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">📄 View Candidate Resume PDF</a>
              </div>
            ` : '<p style="color: #ef4444;">No resume attachment was linked to this profile.</p>'}
            
            <p style="color: #334155; font-size: 15px;">Please let us know your availability to schedule a client interview with this candidate.</p>
            
            <p style="color: #475569; font-size: 14px; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Email successfully sent to Client ${clientEmail}`)
  } catch (error) {
    console.error('Error sending email to client:', error)
  }
}

const sendSentToClientEmailToCandidate = async (candidateEmail, candidateName, clientName, clientCompany, clientEmail, recruiterEmail, adminEmail) => {
  try {
    if (!isSmtpConfigured()) {
      console.log('📧 [DEV MODE] SMTP not configured. Candidate referral update email skipped for:', candidateEmail)
      return
    }

    const ccList = [clientEmail]
    if (recruiterEmail) ccList.push(recruiterEmail)
    if (adminEmail) ccList.push(adminEmail)

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'Contact@astonrecruitment.in',
      to: candidateEmail,
      cc: ccList.filter(Boolean),
      subject: '🎉 Action Required: Update Resume for 2nd Round Review - Aston Recruitment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #b88f3f; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">Aston Recruitment</h1>
            <p style="margin: 4px 0 0 0; color: #fef3c7; font-size: 14px;">2nd Round Evaluation Referral</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #78350f; margin-top: 0;">Good news, ${candidateName}!</h2>
            <p style="color: #334155; font-size: 15px;">We are excited to inform you that your profile has been successfully referred to our client <strong>${clientName}</strong> at <strong>${clientCompany}</strong> for the <strong>2nd Round Interview</strong>.</p>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #b88f3f; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                <strong>Action Required:</strong> Please update your latest resume PDF document in the portal so we can share it with the client.<br/>
                👉 <strong>Path to update in portal:</strong> Log in to your candidate dashboard, click <strong>Edit Profile</strong>, and upload your resume PDF in the <strong>Upload Resume PDF</strong> section.<br/><br/>
                <strong>Client Contact:</strong> ${clientName} (${clientEmail})
              </p>
            </div>

            <p style="color: #334155; font-size: 15px;">The client's team will review your timeline and reach out shortly to lock in a time slot. We have CC'd the assigned recruiter, client contact, and admin on this thread to keep everyone aligned.</p>
            <p style="color: #475569; font-size: 14px; margin-top: 24px;">Best regards,<br/>Aston Recruitment Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Aston Recruitment. All rights reserved.
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Candidate referral update email sent successfully to ${candidateEmail}`)
  } catch (error) {
    console.error('Error sending referral email to candidate:', error)
  }
}

module.exports = {
  sendInterviewScheduledEmail,
  sendResetPasswordEmail,
  sendOtpEmail,
  sendRegistrationSuccessEmail,
  sendSelectionEmail,
  sendRejectionEmail,
  sendSentToClientEmailToClient,
  sendSentToClientEmailToCandidate
}
