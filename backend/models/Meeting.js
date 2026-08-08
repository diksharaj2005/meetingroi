const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  attendees: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  attendeeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  roi: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'scheduled',
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
}, {
  tableName: 'meetings',
  timestamps: true,
  underscored: true,
});

module.exports = Meeting;