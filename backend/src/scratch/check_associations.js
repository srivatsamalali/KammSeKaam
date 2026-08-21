const { User, Candidate, Application } = require('../models')

async function run() {
  const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
  console.log('--- USERS ---')
  console.log(JSON.stringify(users, null, 2))

  const candidates = await Candidate.findAll()
  console.log('--- CANDIDATES ---')
  console.log(JSON.stringify(candidates, null, 2))

  const apps = await Application.findAll()
  console.log('--- APPLICATIONS ---')
  console.log(JSON.stringify(apps, null, 2))
}

run()
