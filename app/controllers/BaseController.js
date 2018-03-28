'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')


exports.findOneMessage = (param) => {
  return function(param){
    return new Promise(function(resolve, reject) {
        if(params!==''){
          Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
            resolve(el)
          })
        }
    })
  }

}
