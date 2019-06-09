const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

//const hostname = "127.0.0.1";
//const hostname = "192.168.1.2";
const port = 3000;

console.log(process.argv);
var relDir = path.dirname(path.relative("", process.argv[1]));
console.log(relDir);

fs.readdir(relDir+'/log', function(err, files){
	if (err)
	{
		fs.mkdirSync(relDir+'/log');
	}
	fs.writeFile(relDir+'/log/test.log',new Date().toLocaleString()+": Server started.\n", { flag: 'a' }, function(err){});
});

function send(res, buf, contentType)
{
    res.writeHead(200, {'Content-Type': contentType});
    res.write(buf);
    res.end();
}

function sendFile(res, filename, contentType)
{
	fs.readFile(filename, function(err, fdata) {
		if (err) {
			res.statusCode = 404;
			res.end();
			return;
		}
		send(res, fdata, contentType);
	});
}

const server = http.createServer(function(req, res){
	var q = url.parse(req.url, true);
	console.log(req.socket.remoteAddress);
	console.log("Username: " + req.headers.username);
	console.log(req.method);
	console.log(req.url);
	console.log(q.query);

	fs.writeFile(relDir+'/test.log',new Date().toLocaleString()+": "+req.socket.remoteAddress+"\n", { flag: 'a' }, function(err){

	});

	var filename;
	var contentType;
	if (req.url=="/") 
	{
		sendFile(res, relDir+"/index.html", "text/html");
	}
	else if (req.url=="/style.css")
	{
		sendFile(res, relDir+"/style.css", "text/css");
	}
	else if (q.pathname == "/getTable")
	{
		console.log("getTable");
		sendFile(res, relDir+"/plan"+q.query.id+".json", "application/json")
	}
	else 
	{
		res.statusCode = 404;
		res.end();
	}
});

/*
server.listen(port, hostname, function(){
	console.log("Server running at http://"+hostname+":"+port+"/");
});
*/

server.listen(port, function(){
	console.log("Server running at port: "+port);
});
