var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonShema = new Schema({
  id:Number,
  name:String,
  urlhinh:String,
  email:String,
  phone:String,
  active:{ type: Number, default: 1 },
  online_at:Date,
  offline_at:Date,
  create_at:Date
});

module.exports = mongoose.model('Person',PersonShema);
