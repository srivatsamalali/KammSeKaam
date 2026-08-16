const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const {
  getDashboardStats,
  getReports,
  overrideCandidateStatus,
  getUnassignedCandidates,
  getAllCandidates,
  deleteCandidate,
  getClients,
  createClient,
  deleteClient,
  impersonateUser,
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

// Client management routes
router.get('/clients', authenticateToken, getClients)
router.post('/clients', authenticateToken, authorizeRole('ADMIN'), createClient)
router.delete('/clients/:id', authenticateToken, authorizeRole('ADMIN'), deleteClient)

// Impersonation route
router.post('/impersonate/:userId', authenticateToken, authorizeRole('ADMIN'), impersonateUser)

module.exports = router
