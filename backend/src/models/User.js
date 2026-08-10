const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const bcrypt = require('bcryptjs')

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'RECRUITER', 'CANDIDATE'),
      defaultValue: 'CANDIDATE',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailOtp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      },
    },
  },
)

User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

module.exports = User
