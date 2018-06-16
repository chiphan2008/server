const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/ssl/private/apache-selfsigned.key'),
  cert: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);
