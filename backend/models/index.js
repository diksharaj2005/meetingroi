const User = require('./User');
const Meeting = require('./Meeting');
const GoogleToken = require('./GoogleToken');

// Define associations
User.hasMany(Meeting, { foreignKey: 'userId', as: 'meetings' });
Meeting.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(GoogleToken, { foreignKey: 'userId', as: 'googleToken' });
GoogleToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

console.log('✅ Models loaded and associations defined');

module.exports = { User, Meeting, GoogleToken };