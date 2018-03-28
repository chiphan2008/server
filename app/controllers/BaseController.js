'use strict';
var async = require('async');
var Conversation = require('../models/Conversation')

let findOneMessage = async (param) => {
  let Conv = () => {
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
  return await Conv();
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
