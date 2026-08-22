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
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  submitClientRequest,
  getClientRequests,
  updateClientRequestStatus,
  deleteClientRequest,
} = require('../controllers/adminController')

const router = express.Router()

// Client Request routes
router.post('/client-requests', submitClientRequest) // Public endpoint for clients to submit hiring requests
router.get('/client-requests', authenticateToken, authorizeRole('ADMIN'), getClientRequests)
router.put('/client-requests/:id/status', authenticateToken, authorizeRole('ADMIN'), updateClientRequestStatus)
router.delete('/client-requests/:id', authenticateToken, authorizeRole('ADMIN'), deleteClientRequest)

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

// Job management routes
router.get('/jobs', getJobs) // Publicly accessible to fetch jobs
router.post('/jobs', authenticateToken, authorizeRole('ADMIN'), createJob)
router.put('/jobs/:id', authenticateToken, authorizeRole('ADMIN'), updateJob)
router.delete('/jobs/:id', authenticateToken, authorizeRole('ADMIN'), deleteJob)

module.exports = router
