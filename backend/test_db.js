const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'meetingroi_db',
  'postgres',
  'Diksha1234',
  {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

async function testSequelize() {
  try {
    console.log('🔍 Testing Sequelize connection...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connected successfully!');
    
    // Test query
    const result = await sequelize.query('SELECT current_database() as db');
    console.log('📊 Connected to database:', result[0][0].db);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sequelize error:', error.message);
    process.exit(1);
  }
}

testSequelize();