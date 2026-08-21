const { Message, Application, Candidate, Recruiter, User, Notification } = require('../models')
const { sendPushNotification } = require('../utils/pushService')
const { Op } = require('sequelize')

const getMessages = async (req, res) => {
  try {
    const { applicationId } = req.params
    const messages = await Message.findAll({
      where: { applicationId },
      include: [{ model: User, attributes: ['id', 'email', 'role'] }],
      order: [['createdAt', 'ASC']],
    })

    // Mark messages sent by others as read
    if (req.user && req.user.id) {
      await Message.update(
        { isRead: true },
        {
          where: {
            applicationId,
            senderId: { [Op.ne]: req.user.id },
            isRead: false
          }
        }
      )
    }

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Error fetching messages', error: error.message })
  }
}

const sendMessage = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { message } = req.body
    const senderId = req.user.id

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' })
    }

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Candidate, include: [User] },
        { model: Recruiter, include: [User] },
      ],
    })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    const newMessage = await Message.create({
      applicationId,
      senderId,
      message: message.trim(),
      isRead: false
    })

    // Find recipient
    let recipientUserId = null
    let senderName = 'Someone'

    const candidateUser = application.Candidate?.User
    const recruiterUser = application.Recruiter?.User

    if (candidateUser && candidateUser.id === senderId) {
      // Sender is candidate, recipient is recruiter
      recipientUserId = recruiterUser?.id
      senderName = application.Candidate.name || 'Candidate'
    } else if (recruiterUser && recruiterUser.id === senderId) {
      // Sender is recruiter, recipient is candidate
      recipientUserId = candidateUser?.id
      senderName = application.Recruiter.name || 'Recruiter'
    }

    if (recipientUserId) {
      try {
        await Notification.create({
          userId: recipientUserId,
          type: 'NEW_MESSAGE',
          message: `New message from ${senderName}: "${message.substring(0, 30)}..."`,
        })
        await sendPushNotification(recipientUserId, {
          title: `Message from ${senderName}`,
          body: message,
          type: 'NEW_MESSAGE',
        })
      } catch (err) {
        console.error('Failed to notify message recipient:', err)
      }
    }

    // Attach sender User details for frontend convenience
    const messageWithUser = await Message.findByPk(newMessage.id, {
      include: [{ model: User, attributes: ['id', 'email', 'role'] }],
    })

    res.status(201).json(messageWithUser)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Error sending message', error: error.message })
  }
}

module.exports = { getMessages, sendMessage }
