const maria = require('mysql');

const conn = maria.createConnection({
    host: '35.234.145.249',
    port: 3306,
    user: 'sd3project',
    password: '1234',
    database: 'wordfrequency',
});

module.exports = conn;