const mysql = require('mysql2')
const {database} = require('./config.json')

const db = mysql.createPool({
    host: database.host,
    user: database.dbuser,
    password: database.password,
    database: database.dbname,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  module.exports = db