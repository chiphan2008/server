'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')


exports.findOneMessage = (param) => {
  return async (param) => {
    return await new Promise(function(resolve, reject) {
        if(params!==''){
          Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
            resolve(el)
          })
        }
    })
  }

}
