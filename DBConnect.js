const mysql = require('mysql');
require('dotenv').config(); 

const conn = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    port: process.env.port
})

conn.connect(function(err) {
    err ? console.log("Error: " + err) : console.log("Connected!");
})

module.exports.conn = conn;