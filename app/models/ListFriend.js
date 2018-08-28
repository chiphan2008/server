var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListFriendShema = new Schema({
  id:Number,
  friends:Array
});

module.exports = mongoose.model('ListFriend',ListFriendShema);
