'use strict';
async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = async(param) =>{
  Conversation.findOne({group:param}).sort('-create_at').exec(function(err, el){
    return el;
  });
}
