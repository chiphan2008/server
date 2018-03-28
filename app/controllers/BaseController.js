'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

let findOneMessage = async (param) => {
  return await function(param){
    return new Promise(function(resolve, reject) {
        if(params!==''){
          Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
            resolve(el)
          })
        }
    })
  }
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
