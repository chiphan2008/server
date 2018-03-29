
var Conversation = require('../models/Conversation')

// exports.findOneMessage = (param) => {
//   return Conversation.findOne({group:param}).sort('-create_at').exec()
// }
module.exports.findListFriend = (user_id) => {
  return new Promise(function(resolve,reject){
    Person.findOne({id:user_id}).exec(function(err, el){
      if(err) reject(err)
      resolve(el)
    });
  })
}
// data.push(el);
// if(index===arr.friends.length-1) res.json({data})
//module.exports.findOneMessage = findOneMessage;
// exports.findOneMessage = (param) => {
// }
