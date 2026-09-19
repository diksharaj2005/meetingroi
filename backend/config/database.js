const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Explicitly require pg so Vercel bundles it
const pg = require('pg');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // ✅ Force Sequelize to use the bundled pg module
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

module.exports = { sequelize, connectDB };