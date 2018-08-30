var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistoryChatShema = new Schema({
  user_id:Number,
  friend_id:Number,
  last_message:String,
  update_at:Date,
  create_at:Date
});

module.exports = mongoose.model('HistoryChat',HistoryChatShema);
