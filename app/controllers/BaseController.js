var Conversation = require('../models/Conversation')

exports.findOneMessage = asyn(param) => {
  Conversation.find({group:param}).sort('-create_at').limit(1).exec(function(err, el){
    return await el;
  });
}
