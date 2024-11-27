const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Database username
  // process.env.DB_PASSWORD, // Database password
  'Qit123@#India',
  {
    host: process.env.DB_HOST, // Host (e.g., localhost)
    dialect: process.env.DB_DIALECT, // Dialect (e.g., 'mysql', 'mssql')
    logging: false, // Disable logging
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
})();

module.exports = sequelize;
