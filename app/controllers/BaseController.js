'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  var p1 = new Promise(function(resolve, reject) {
      if(params!==''){
        Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
          resolve(el)
        })
      }
  })
  p1.then(el=>{
    return el;
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
