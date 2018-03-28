'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

exports.findOneMessage = (param) =>{
  return Conversation.findOne({group:param}).sort('-create_at').exec()

}
