const express = require('express')
const { authenticateToken } = require('../middlewares/auth')
const {
  getNotifications,
  markAsRead,
} = require('../controllers/notificationController')

const router = express.Router()

router.get('/', authenticateToken, getNotifications)
router.put('/:notificationId/read', authenticateToken, markAsRead)

module.exports = router
