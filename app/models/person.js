var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonShema = new Schema({
  id:Number,
  name:String,
  urlhinh:String,
  email:String,
  phone:String,
  friends:{ type : Array , "default" : [] },
  active:{ type: Number, default: 1 },
  online_at:{ type: Date, default: Date.now() },
  offline_at:{ type: Date },
  create_at:{ type: Date, default: Date.now() }
});

module.exports = mongoose.model('Person',PersonShema);
