const User = require('./User')
const Candidate = require('./Candidate')
const Recruiter = require('./Recruiter')
const Application = require('./Application')
const Notification = require('./Notification')
const PushSubscription = require('./PushSubscription')
const Message = require('./Message')
const Client = require('./Client')
const Job = require('./Job')
const ClientRequest = require('./ClientRequest')

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

User.hasMany(PushSubscription, { foreignKey: 'userId', onDelete: 'CASCADE' })
PushSubscription.belongsTo(User, { foreignKey: 'userId' })

Application.hasMany(Message, { foreignKey: 'applicationId', onDelete: 'CASCADE' })
Message.belongsTo(Application, { foreignKey: 'applicationId' })
Message.belongsTo(User, { foreignKey: 'senderId' })

Client.hasMany(Application, { foreignKey: 'clientId', onDelete: 'SET NULL' })
Application.belongsTo(Client, { foreignKey: 'clientId' })

Job.hasMany(Application, { foreignKey: 'jobId', onDelete: 'SET NULL' })
Application.belongsTo(Job, { foreignKey: 'jobId' })

module.exports = {
  User,
  Candidate,
  Recruiter,
  Application,
  Notification,
  PushSubscription,
  Message,
  Client,
  Job,
  ClientRequest,
}
