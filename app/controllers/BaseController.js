'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  return new Promise(function(resolve, reject) {
    Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
      return resolve(el)
    })
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
