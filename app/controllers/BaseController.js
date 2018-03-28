'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  return new Promise((resole, reject)=>{
    Conversation.findOne({group:param}).sort('-create_at').exec(function(err, el){
      resole(el);
    })
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
