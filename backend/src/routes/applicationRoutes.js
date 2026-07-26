const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const {
  assignCandidate,
  updateApplicationStatus,
  scheduleInterview,
  addInterviewFeedback,
} = require('../controllers/applicationController')

const router = express.Router()

router.post(
  '/assign',
  authenticateToken,
  authorizeRole('ADMIN'),
  assignCandidate,
)
router.put(
  '/:applicationId/status',
  authenticateToken,
  authorizeRole('ADMIN', 'RECRUITER'),
  updateApplicationStatus,
)
router.put(
  '/:applicationId/interview',
  authenticateToken,
  authorizeRole('RECRUITER'),
  scheduleInterview,
)
router.put(
  '/:applicationId/feedback',
  authenticateToken,
  authorizeRole('RECRUITER'),
  addInterviewFeedback,
)

module.exports = router
