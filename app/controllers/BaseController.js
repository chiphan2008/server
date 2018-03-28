'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')
var ConvOfPer = (param) => {
  return new Promise(function(resolve, reject) {
      if(params!==''){
        Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
          resolve(el)
        })
      }
  })
}
var getOneConv = async (param) => {
  return await ConvOfPer(param);
}
exports.findOneMessage = (param) => {
  return getOneConv(param);
}
