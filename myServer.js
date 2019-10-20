const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(req, res){
	var q = url.parse(req.url, true);
	console.log(req.method);
	console.log(req.url);
	console.log(req.headers);
	console.log(q);
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});

server.listen(port, hostname, function(){
	console.log(`Server running at http://${hostname}:${port}/`);
});