'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')
var Conv = (param) =>{
  return new Promise(function(resolve, reject) {
      if(params!==''){
        Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
          resolve(el)
        })
      }
  })
}
async findOneMessage(param){
  return Conv(param);
}

module.exports.findOneMessage = findOneMessage;

// exports.findOneMessage = (param) => {
// }
