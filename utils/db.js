var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/hab-petition"
);

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
    return db.query(
        `SELECT users.password, users.id, signatures.id
        AS sigId FROM users LEFT JOIN signatures ON signatures.user_id = users.id WHERE email=$1`,
        [email]
    );
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
    return db.query(
        `SELECT users.first_name AS firstName, users.last_name AS lastName, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        `
    );
};

module.exports.getSignersByCity = function(city) {
    return db.query(
        `
        SELECT users.first_name AS firstName, users.last_name AS lastName, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1);
        `,
        [city]
    );
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

// ***** EDIT PROFILE ROUTE *****
module.exports.editProfile = function(id) {
    return db.query(
        `SELECT users.first_name AS firstName, users.last_name AS lastName, users.email AS email, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
       FROM users
       LEFT JOIN user_profiles
       ON users.id = user_profiles.user_id
       WHERE users.id = $1`,
        [id]
    );
};

module.exports.updateUsersTableWithPass = function(
    firstName,
    lastName,
    email,
    password,
    userID
) {
    return db.query(
        `UPDATE users SET first_name=$1, last_name=$2, email=$3, password=$4 WHERE id=$5`,
        [firstName, lastName, email, password, userID]
    );
};

module.exports.updateUsersTableNoPass = function(
    firstName,
    lastName,
    email,
    userID
) {
    return db.query(
        `UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4`,
        [firstName, lastName, email, userID]
    );
};

module.exports.updateUserProfiles = function(age, city, homepage, userID) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age=$1, city=$2, url=$3`,
        [
            age ? Number(age) : null || null,
            city || null,
            homepage || null,
            userID
        ]
    );
};
