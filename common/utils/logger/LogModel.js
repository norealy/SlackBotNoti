const mongoose = require('mongoose');
const mongo = require('./DatabaseLog');
const {Schema} = mongoose;
const userSchema = new Schema({
	requestStart: {type: Number, unique: true},
	personality: {type: String, unique: true},
	method: {type: String, unique: true},
	url: {type: String, unique: true},
	statusCode: {type: Number, unique: true},
	httpVersion: {type: String, unique: true},
	processingTime: {type: Number, unique: true},
	headers: {type: String, unique: true},
});

module.exports = mongo.model('logs', userSchema);
