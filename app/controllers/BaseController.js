
exports.createNSP = function(port){
  var io = require('socket.io')(server, {pingTimeout: 30000});
  var nsp = io.of('/'+port);
  nsp.on('connection', function(socket) {
     nsp.on('sendMessage',function(data){
       console.log(data);
       nsp.emit('replyMessage', data);
     })
  });
}
