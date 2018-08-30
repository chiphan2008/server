var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConversationShema = new Schema({
  group:String,
  user_id:Number,
  message:String,
  watched:{ type: Number, default: 1 },
  create_at:{ type: Date, default: Date.now() }
});

module.exports = mongoose.model('Conversation',ConversationShema);
