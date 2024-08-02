const { Sequelize } = require("sequelize");
const path = require("node:path");
const os = require("node:os");

// Get the users home directory
const homeDir = os.homedir();

// Define the path to the SQLite database file
const dbPath = path.join(homeDir, "turtledb.sqlite");

/**
 * The Sequelize instance that represents the database connection.
 */
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
});

module.exports = sequelize;
