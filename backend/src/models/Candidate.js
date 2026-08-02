const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Candidate = sequelize.define('Candidate', {
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
    allowNull: true,
    defaultValue: '',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  dob: {
    type: DataTypes.DATE,
  },
  experience: {
    type: DataTypes.INTEGER,
  },
  technicalSkills: {
    type: DataTypes.JSON,
  },
  highestQualification: {
    type: DataTypes.STRING,
  },
  currentCompany: {
    type: DataTypes.STRING,
  },
  currentCTC: {
    type: DataTypes.DECIMAL(10, 2),
  },
  expectedCTC: {
    type: DataTypes.DECIMAL(10, 2),
  },
  currentLocation: {
    type: DataTypes.STRING,
  },
  preferredLocation: {
    type: DataTypes.STRING,
  },
  noticePeriod: {
    type: DataTypes.STRING,
  },
  resumePath: {
    type: DataTypes.STRING,
  },
})

module.exports = Candidate
