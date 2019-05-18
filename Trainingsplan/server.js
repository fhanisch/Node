const http = require('http');
const url = require('url');
var fs = require('fs');

//const hostname = "127.0.0.1";
const hostname = "192.168.1.2";
const port = 3000;

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
	console.log(req.method);
	console.log(req.url);
	console.log(q.query);
	var filename;
	var contentType;
	if (req.url=="/") 
	{
		sendFile(res, "index.html", "text/html");
	}
	else if (req.url=="/style.css")
	{
		sendFile(res, "style.css", "text/css");
	}
	else if (q.pathname == "/getTable")
	{
		console.log("getTable");
		sendFile(res, "plan"+q.query.id+".json", "application/json")
	}
	else 
	{
		res.statusCode = 404;
		res.end();
	}
});

server.listen(port, hostname, function(){
	console.log("Server running at http://"+hostname+":"+port+"/");
});
