const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Candidates',
      key: 'id',
    },
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Jobs',
      key: 'id',
    },
  },
  recruiterId: {
    type: DataTypes.UUID,
    references: {
      model: 'Recruiters',
      key: 'id',
    },
  },
  clientId: {
    type: DataTypes.UUID,
    references: {
      model: 'Clients',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM(
      'APPLICATION_RECEIVED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'SELECTED',
      'REJECTED',
      'SENT_TO_CLIENT',
    ),
    defaultValue: 'APPLICATION_RECEIVED',
  },
  interviewDate: {
    type: DataTypes.DATE,
  },
  googleMeetLink: {
    type: DataTypes.STRING,
  },
  interviewDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  technicalRating: {
    type: DataTypes.INTEGER,
  },
  communicationRating: {
    type: DataTypes.INTEGER,
  },
  culturalRating: {
    type: DataTypes.INTEGER,
  },
  feedbackComments: {
    type: DataTypes.TEXT,
  },
  recommendation: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

module.exports = Application
