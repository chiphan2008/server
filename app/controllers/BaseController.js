
var Person = require('../models/person')

// exports.findOneMessage = (param) => {
//   return Conversation.findOne({group:param}).sort('-create_at').exec()
// }
findListFriend = (user_id) => {
  return new Promise((resolve,reject)=>{
    Person.findOne({id:user_id}).exec(function(err, el){
      if(err) return reject(err)
      return resolve(el)
    });
  })
}
// data.push(el);
// if(index===arr.friends.length-1) res.json({data})
module.exports.findListFriend = findListFriend;
// exports.findOneMessage = (param) => {
// }
