const redis = require("redis");
const { promisify } = require("util");

var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log("error in redis: ", err);
});
exports.setex = promisify(client.setex.bind(client));

// client.setex("funky", 60, "chicken", function(err, data) {
//     console.log(err, data);
// });

/// index.js
exports.get = promisify(client.get.bind(client));

exports.del = promisify(client.del.bind(client));

const { setex, get, del } = require("./redis");

setex("leo", 60, JSON.stringify({ name: "Leonardo" }));
