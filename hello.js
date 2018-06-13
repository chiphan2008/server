
const http = require('http');
const port = 80;
const ip = '112.213.94.96';

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World');
}).listen(port,ip);

console.log(`server is running on ${ip}:${port}`);
