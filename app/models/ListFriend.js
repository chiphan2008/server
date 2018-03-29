var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListFriendShema = new Schema({
  id:Number,
  group: String,
  message: String,
  name:String,
  urlhinh:String,
  status:Number,
  online_at:{ type: Date },
  offline_at:{ type: Date },
  addfriend_at:{ type: Date }
});

module.exports = mongoose.model('ListFriend',ListFriendShema);
