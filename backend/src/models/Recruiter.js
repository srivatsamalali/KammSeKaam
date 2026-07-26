const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Recruiter = sequelize.define('Recruiter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.JSON,
  },
  assignedCandidates: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
})

module.exports = Recruiter
