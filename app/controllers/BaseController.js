
var Person = require('../models/person')

// exports.findOneMessage = (param) => {
//   return Conversation.findOne({group:param}).sort('-create_at').exec()
// }
let findLF = (user_id) => {
  return new Promise((resolve,reject)=>{
    Person.findOne({id:user_id}).exec(function(err, el){
      if(err) return reject(err)
      return resolve(el)
    });
  })
}

exports.findListFriend = (user_id) => {
  return findLF(user_id);
}
