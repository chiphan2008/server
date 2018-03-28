'use strict';
var async = require('async')
var Conversation = require('../models/Conversation')

var getOneConv = (param) => {
  return new Promise(function(resolve, reject) {
    Conversation.findOne({group:param}).sort('-create_at').execSync((err,el)=>{
      if (err) reject(err);
      resolve(el)
    })
  })

}

let findOneMessage =  (param) => {
  return getOneConv(param).then(el =>{
    return el;
  });
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
