const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Applications',
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

module.exports = Message
