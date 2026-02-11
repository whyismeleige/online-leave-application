const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = require("./User.model");
db.leave = require("./Leave.model"); // ← Add this line

module.exports = db;