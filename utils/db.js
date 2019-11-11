var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/hab-petition");

module.exports.getUser = function(email) {
    return db.query(`SELECT password FROM users WHERE email=$1`, [email]);
};

// returns the count of signatures
module.exports.getSignatureCount = function() {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSignature = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id=$1`, [id]);
};

module.exports.addSignature = function(
    first_name,
    last_name,
    signature,
    userID
) {
    return db.query(
        `INSERT INTO signatures (first_name, last_name, signature, user_id) VALUES ($1, $2, $3, $4)
RETURNING id
        `,
        [first_name, last_name, signature, userID]
    );
};

module.exports.getName = function(id) {
    return db.query(`SELECT first_name FROM signatures WHERE id=$1`, [id]);
};

module.exports.registerUser = function(first_name, last_name, email, password) {
    return db.query(
        `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, email, password]
    );
};

module.exports.getSigners = function() {
    return db.query(`SELECT first_name, last_name FROM signatures`);
};
