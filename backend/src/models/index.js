const User = require('./User')
const Candidate = require('./Candidate')
const Recruiter = require('./Recruiter')
const Application = require('./Application')
const Notification = require('./Notification')

// Define associations
User.hasOne(Candidate, { foreignKey: 'userId', onDelete: 'CASCADE' })
Candidate.belongsTo(User, { foreignKey: 'userId' })

User.hasOne(Recruiter, { foreignKey: 'userId', onDelete: 'CASCADE' })
Recruiter.belongsTo(User, { foreignKey: 'userId' })

Candidate.hasMany(Application, {
  foreignKey: 'candidateId',
  onDelete: 'CASCADE',
})
Application.belongsTo(Candidate, { foreignKey: 'candidateId' })

Recruiter.hasMany(Application, {
  foreignKey: 'recruiterId',
  onDelete: 'SET NULL',
})
Application.belongsTo(Recruiter, { foreignKey: 'recruiterId' })

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' })
Notification.belongsTo(User, { foreignKey: 'userId' })

module.exports = {
  User,
  Candidate,
  Recruiter,
  Application,
  Notification,
}
