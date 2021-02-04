const mongoose = require('mongoose');
const mongo = require('./DatabaseLog');
const {Schema} = mongoose;
const userSchema = new Schema({
	requestStart: {type: Number, required: true},
	personality: {type: String, required: true},
	method: {type: String, required: true},
	url: {type: String, required: true},
	statusCode: {type: Number, required: true},
	httpVersion: {type: String, required: true},
	processingTime: {type: Number, required: true},
	headers: {type: String, required: true},
});

module.exports = mongo.model('logs', userSchema);
