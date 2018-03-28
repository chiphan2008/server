'use strict';
var async = require('async')
var Conversation = require('../models/Conversation')

let findOneMessage = async (param) => {
  return new Promise(function(resolve, reject) {
    try{
      Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
        resolve(el)
      })
    }catch(err){
      reject(err)
    }
  })
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
