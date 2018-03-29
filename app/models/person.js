var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonShema = new Schema({
  id:Number,
  name:String,
  urlhinh:String,
  update_at:{ type: Date },
  create_at:{ type: Date }
});

module.exports = mongoose.model('Person',PersonShema);
