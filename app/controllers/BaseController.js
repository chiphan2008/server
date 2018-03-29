
var Conversation = require('../models/Conversation')

// exports.findOneMessage = (param) => {
//   return Conversation.findOne({group:param}).sort('-create_at').exec()
// }
findListFriend.exports = (user_id) => {
  return new Promise(function(resolve,reject){
    Person.findOne({id:user_id}).exec(function(err, el){
      if(err) reject(err)
      resolve(el)
    });
  })
}
