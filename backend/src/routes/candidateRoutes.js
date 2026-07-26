const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const uploadResume = require('../middlewares/fileUpload')
const {
  getProfile,
  updateProfile,
} = require('../controllers/candidateController')
const {
  getCandidateApplications,
} = require('../controllers/candidateController')

const router = express.Router()

router.get(
  '/profile',
  authenticateToken,
  authorizeRole('CANDIDATE'),
  getProfile,
)
router.put(
  '/profile',
  authenticateToken,
  authorizeRole('CANDIDATE'),
  uploadResume.single('resume'),
  updateProfile,
)

router.get(
  '/applications',
  authenticateToken,
  authorizeRole('CANDIDATE'),
  getCandidateApplications,
)

module.exports = router
