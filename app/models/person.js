var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonShema = new Schema({
  id:Number,
  name:String,
  urlhinh:String
});

module.exports = mongoose.model('Person',PersonShema);
