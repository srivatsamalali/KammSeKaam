const { Notification } = require('../models')

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    })

    res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res
      .status(500)
      .json({ message: 'Error fetching notifications', error: error.message })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findByPk(notificationId)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    notification.isRead = true
    await notification.save()

    res.json({ message: 'Notification marked as read', notification })
  } catch (error) {
    console.error('Mark as read error:', error)
    res
      .status(500)
      .json({ message: 'Error marking notification', error: error.message })
  }
}

module.exports = { getNotifications, markAsRead }
