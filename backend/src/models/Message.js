const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    applicationId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'Applications',
        key: 'id',
      },
    },

    senderId: {
      type: DataTypes.STRING(36),
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

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
)

module.exports = Message