require('dotenv').config()

module.exports = {
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  expiration: process.env.JWT_EXPIRATION || '7d',
}
