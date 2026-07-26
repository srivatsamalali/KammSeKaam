require('dotenv').config()
const sequelize = require('../src/config/database')
const { User } = require('../src/models')
const bcrypt = require('bcryptjs')

const [, , email, newPass] = process.argv
if (!email || !newPass) {
  console.error('Usage: node scripts/set_password.js <email> <newPassword>')
  process.exit(1)
}

;(async () => {
  try {
    await sequelize.authenticate()
    // ensure models are available
    await sequelize.sync()
    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.error('User not found:', email)
      process.exit(1)
    }

    const hashed = await bcrypt.hash(newPass, 10)
    user.password = hashed
    await user.save()

    console.log('Password updated for', email)
    process.exit(0)
  } catch (err) {
    console.error('Error updating password:', err)
    process.exit(1)
  }
})()
