const sequelize = require('../src/config/database')
const { User, Recruiter } = require('../src/models')

const check = async () => {
  try {
    const users = await User.findAll({ where: { role: 'RECRUITER' } })
    console.log('--- RECRUITER USERS IN DB (' + users.length + ') ---')
    users.forEach(u => console.log(`User ID: ${u.id} | Email: ${u.email}`))

    const recruiters = await Recruiter.findAll({ include: [{ model: User, attributes: ['email'] }] })
    console.log('\n--- RECRUITER PROFILES IN DB (' + recruiters.length + ') ---')
    recruiters.forEach(r => console.log(`Recruiter ID: ${r.id} | UserID: ${r.userId} | Name: ${r.name} | UserEmail: ${r.User?.email}`))

    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

check()
