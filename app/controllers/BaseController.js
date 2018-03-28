
var Conversation = require('../models/Conversation')

let findOneMessage = (param) => {
  return new Promise(function(resolve, reject) {
    Conversation.find({group:param}).sort('-create_at').limit(1).exec((err,el)=>{
      if (err) reject(err);
      resolve(el)
    })
  })
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
