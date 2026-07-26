const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const {
  getDashboardStats,
  getReports,
  overrideCandidateStatus,
  getUnassignedCandidates,
} = require('../controllers/adminController')

const router = express.Router()

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole('ADMIN'),
  getDashboardStats,
)
router.get('/reports', authenticateToken, authorizeRole('ADMIN'), getReports)
router.get(
  '/unassigned',
  authenticateToken,
  authorizeRole('ADMIN'),
  getUnassignedCandidates,
)
router.put(
  '/applications/:applicationId',
  authenticateToken,
  authorizeRole('ADMIN'),
  overrideCandidateStatus,
)

module.exports = router
