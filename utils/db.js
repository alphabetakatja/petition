var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/hab-petition");

// ***** PETITION ROUTE *****
module.exports.addSignature = function(signature, userID) {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2)
RETURNING id
        `,
        [signature, userID]
    );
};

// ***** REGISTER ROUTE *****
module.exports.registerUser = function(first_name, last_name, email, password) {
    return db.query(
        `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, email, password]
    );
};

// ***** LOGIN ROUTE *****
module.exports.getUserInfo = function(email) {
    return db.query(`SELECT * FROM users WHERE email=$1`, [email]);
};

module.exports.checkIfSigned = function(id) {
    return db.query(`SELECT * FROM signatures WHERE user_id = $1`, [id]);
};

// ***** THANK-YOU ROUTE *****
// returns the count of signatures
module.exports.getSignatureCount = function() {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSignature = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id=$1`, [id]);
};

// ***** SIGNERS-LIST ROUTE *****
module.exports.getSigners = function() {
    return db.query(`SELECT * FROM signatures`);
};

// ***** PROFILE ROUTE *****
module.exports.addProfile = function(age, city, homepage, userID) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES($1, $2, $3, $4) RETURNING id`,
        [
            // user can only write a number, not a string!
            age ? Number(age) : null || null,
            city || null,
            homepage || null,
            userID
        ]
    );
};
