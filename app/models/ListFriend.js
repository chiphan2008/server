var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListFriendShema = new Schema({
  id:Number,
  friends:Array,
  addfriend_at:{ type: Date, default : Date.now() }
});

module.exports = mongoose.model('ListFriend',ListFriendShema);
