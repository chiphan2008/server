'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = async(param) =>{
  return Conversation.findOne({group:param}).sort('-create_at').exec();
}
