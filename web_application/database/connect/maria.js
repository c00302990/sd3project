const maria = require('mysql2');

const conn = maria.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'wordFrequency'
});

module.exports = conn;