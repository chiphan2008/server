
var Conversation = require('../models/Conversation')

let findOneMessage = (param) => {
  return new Promise(function(resolve, reject) {
    Conversation.findOne({group:param}).sort('create_at').exec((err,el)=>{
      if (err) reject(err);
      resolve(el)
    })
  })
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
