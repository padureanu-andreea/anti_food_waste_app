const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const UserTag = sequelize.define(
  'UserTag',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
  },
  
);

module.exports = UserTag;
