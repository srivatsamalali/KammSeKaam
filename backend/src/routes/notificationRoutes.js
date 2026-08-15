const express = require('express')
const { authenticateToken } = require('../middlewares/auth')
const {
  getNotifications,
  markAsRead,
  saveSubscription,
} = require('../controllers/notificationController')

const router = express.Router()

router.get('/', authenticateToken, getNotifications)
router.put('/:notificationId/read', authenticateToken, markAsRead)
router.post('/subscribe', authenticateToken, saveSubscription)

module.exports = router
