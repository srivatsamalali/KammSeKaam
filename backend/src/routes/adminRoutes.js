const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const {
  getDashboardStats,
  getReports,
  overrideCandidateStatus,
  getUnassignedCandidates,
  getAllCandidates,
  deleteCandidate,
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
router.get(
  '/candidates',
  authenticateToken,
  authorizeRole('ADMIN'),
  getAllCandidates,
)
router.delete(
  '/candidates/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  deleteCandidate,
)

module.exports = router
