// db.js

var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/hab-petition");

// sql queries/commands in our code go here

module.exports.addSignature = function(id, first_name, last_name, signature) {
    return db.query(
        `INSERT INTO signatures (id, first_name, last_name, signature) VALUES ($1, $2, $3, $4)`,
        [id, first_name, last_name, signature]
    );
};

module.exports.getSignature = function() {
    return db.query(`SELECT signature FROM signatures WHERE id =$1`);
};

module.exports.getSigners = function() {
    return db.query(
        `SELECT first_name AS First Name, last_name AS Last Name FROM signatures`
    );
};

// module.exports.getCities = function() {
//     return db.query(`SELECT * FROM cities`);
// };
//
// module.exports.addCity = function(city, population) {
//     // db.query can accept 2 args, the 2nd arg is an array of all the args passed to the function
//     return db.query(
//         `INSERT INTO cities (city, population) VALUES ($1, $2)`, // all the way up to $20
//         [city, population]
//     );
// };
