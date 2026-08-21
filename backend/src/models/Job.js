const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT,
  },
  salary: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED'),
    defaultValue: 'OPEN',
  },
  applyUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
})

module.exports = Job
