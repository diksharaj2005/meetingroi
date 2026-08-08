const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GoogleToken = sequelize.define('GoogleToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'google_tokens',
  timestamps: true,
  underscored: true,
});

module.exports = GoogleToken;