'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  return new Promise((resole, reject)=>{
    resole(Conversation.findOne({group:param}).sort('-create_at').exec());
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
