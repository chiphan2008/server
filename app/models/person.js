var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonShema = new Schema({
  id:Number,
  name:String,
  urlhinh:String,
  email:String,
  phone:String,
  active:{ type: Number, default: 1 },
  online_at:{ type: Date, default: Date.now() },
  offline_at:{ type: Date, default: Date.now() },
  create_at:{ type: Date, default: Date.now() }
});

module.exports = mongoose.model('Person',PersonShema);
