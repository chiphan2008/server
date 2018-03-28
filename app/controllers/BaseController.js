'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  var objCoversation =  new Promise((resole, reject)=>{
    Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
      return resole(el)
    });
  });
  objCoversation.then(e=>{
    return e;
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
