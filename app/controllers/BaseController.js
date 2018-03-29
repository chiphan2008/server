
var Conversation = require('../models/Conversation')

let findOneMessage = (param) => {
  Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
    return el;
  })
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
