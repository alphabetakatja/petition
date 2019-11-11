const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

// will be called in the post registration route - the first thing
// you wanna run this fn and pass the password that the user gave, the result will be the hash
exports.hash = function(password) {
    return genSalt().then(salt => {
        return hash(password, salt);
    });
};

// will be called in the post login route;
exports.compare = promisify(bcrypt.compare);
// compare takes 2 args:
// 1. password user sends from the client(browser),
// 2. the hashed password from the database
// if they match then we should be able to log in, if not render an err message
// if match return true(boolean - check in conditional), of match return false - no match
