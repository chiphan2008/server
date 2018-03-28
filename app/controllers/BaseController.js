'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  new Promise(function(resolve, reject) {
      if(params!==''){
        Conversation.findOne({group:params}).sort('-create_at').exec((err,el)=>{
          resolve(el)
        })
      }
  }).then(el=>{
    return el;
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
