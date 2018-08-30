var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistoryChatShema = new Schema({
  id:Number,
  history:Array
});

module.exports = mongoose.model('HistoryChat',HistoryChatShema);
