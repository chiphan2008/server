'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')
var params = '';
var p1 = new Promise(function(resolve, reject) {

  setTimeout(()=>{
    if(params!==''){
      Conversation.findOne({group:params}).sort('-create_at').exec((err,el)=>{
        return resolve(el)
      })
    }
  },2000)
})
exports.findOneMessage = (param) =>{
  params=param;
  p1.then(el=>{
    return el;
  })
  //return Conversation.findOne({group:param}).sort('-create_at').exec()
}
