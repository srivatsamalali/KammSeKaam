const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiration },
  )
}

const generateResetToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: '1h' })
}

const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret)
  } catch (error) {
    return null
  }
}

module.exports = { generateToken, generateResetToken, verifyResetToken }
