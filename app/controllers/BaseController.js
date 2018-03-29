
var Conversation = require('../models/Conversation')

let findOneMessage = (param) => {
  return Conversation.findOne({group:param}).sort('-create_at').exec()
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
