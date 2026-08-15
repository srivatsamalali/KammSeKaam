const express = require('express')
const { authenticateToken } = require('../middlewares/auth')
const { getMessages, sendMessage } = require('../controllers/messageController')

const router = express.Router()

router.get('/:applicationId/messages', authenticateToken, getMessages)
router.post('/:applicationId/messages', authenticateToken, sendMessage)

module.exports = router
