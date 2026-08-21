const sequelize = require('../config/database')

async function run() {
  try {
    console.log('Running migration to add isRead to Messages table...')
    await sequelize.query(`
      ALTER TABLE Messages ADD COLUMN isRead BOOLEAN DEFAULT FALSE;
    `)
    console.log('Successfully added isRead column!')
  } catch (error) {
    if (error.message.includes('duplicate column') || error.message.includes('already exists') || error.message.includes('Duplicate column')) {
      console.log('Column isRead already exists. Skipping.')
    } else {
      console.error('Migration failed:', error)
    }
  } finally {
    await sequelize.close()
  }
}

run()
