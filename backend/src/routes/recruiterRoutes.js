const express = require('express')
const { authenticateToken, authorizeRole } = require('../middlewares/auth')
const {
  getAllRecruiters,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  getRecruiterApplications,
} = require('../controllers/recruiterController')

const router = express.Router()

router.get('/', authenticateToken, authorizeRole('ADMIN'), getAllRecruiters)
router.post('/', authenticateToken, authorizeRole('ADMIN'), createRecruiter)
router.put('/:id', authenticateToken, authorizeRole('ADMIN'), updateRecruiter)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  deleteRecruiter,
)
router.get(
  '/applications',
  authenticateToken,
  authorizeRole('RECRUITER'),
  getRecruiterApplications,
)

module.exports = router
