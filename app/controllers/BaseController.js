'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')
var param = '';
var objConversation = new Promise(function(resolve, reject) {
  if(param!==''){
    Conversation.findOne({group:param}).sort('-create_at').exec((err,el)=>{
      return resolve(el)
    })
  }
})
exports.findOneMessage = (param) =>{
  objConversation.then(el => {
    return el;
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
