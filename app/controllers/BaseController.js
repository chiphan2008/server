
exports.findOneMessage = (param) => {
  var Conversation = require('../models/Conversation')
  Conversation.find({group:param}).sort('-create_at').limit(1).exec(function(err, el){
    return el;
  });
}
