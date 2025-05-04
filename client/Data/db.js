// client/Data/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './client/Data/database.sqlite',
  logging: false,
});

module.exports = sequelize;
