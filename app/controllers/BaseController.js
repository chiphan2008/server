'use strict';
//async = require('async');

var Conversation = require('../models/Conversation')

module.exports = {

  // async getPosts (perPage = 10) {
  //   const {data} = await axios.get(endpoint + '/posts?_embed&per_page=' + perPage)
  //   return data
  // }
  findOneMessage =  (param) =>{
    return  Conversation.findOne({group:param}).sort('-create_at').exec();
  }

}
