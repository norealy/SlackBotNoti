const mongoose = require('mongoose');
const {Schema} = mongoose;
const logSchema = new Schema({
  requestStart: {type: Number, required: true},
  personality: {type: String, required: true},
  method: {type: String, required: true},
  url: {type: String, required: true},
  statusCode: {type: Number, required: true},
  httpVersion: {type: String, required: true},
  processingTime: {type: Number, required: true},
  headers: {type: String, required: true},
});
let model = "";

module.exports = function (mongo) {
  if (!model) model = mongo.model('logs', logSchema);
  return model
};
