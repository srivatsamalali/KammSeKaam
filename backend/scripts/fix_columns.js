const sequelize = require('../src/config/database')

const fixColumns = async () => {
  try {
    console.log('Running MySQL table column migration...')

    await sequelize.query(
      'ALTER TABLE Recruiters MODIFY COLUMN mobileNumber VARCHAR(255) NULL DEFAULT ""'
    )
    await sequelize.query(
      'ALTER TABLE Recruiters MODIFY COLUMN address TEXT NULL'
    )
    await sequelize.query(
      'ALTER TABLE Candidates MODIFY COLUMN mobileNumber VARCHAR(255) NULL DEFAULT ""'
    )
    await sequelize.query(
      'ALTER TABLE Candidates MODIFY COLUMN address TEXT NULL'
    )

    console.log('✅ ALTER TABLE MIGRATION COMPLETED SUCCESSFULLY!')
    process.exit(0)
  } catch (error) {
    console.error('❌ MIGRATION ERROR:', error)
    process.exit(1)
  }
}

fixColumns()
