// db.js

var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/hab-petition");

// sql queries/commands in our code go here
// ("SELECT * FROM cities");
// ("SELECT city, population FROM cities");

module.exports.getCities = function() {
    return db.query(`SELECT * FROM cities`);
};

module.exports.addCity = function(city, population) {
    // db.query can accept 2 args, the 2nd arg is an array of all the args passed to the function
    return db.query(
        `INSERT INTO cities (city, population) VALUES ($1, $2)`, // all the way up to $20
        [city, population]
    );
};
