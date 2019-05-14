const http = require('http');
const url = require('url');
var fs = require('fs');

const hostname = "192.168.1.2";
const port = 3000;

function send(res, buf, contentType)
{
    res.writeHead(200, {'Content-Type': contentType});
    res.write(buf);
    res.end();
}

const server = http.createServer(function(req, res){
	var q = url.parse(req.url, true);
	console.log(req.method);
	console.log(req.url);
	//console.log(q);
	var filename;
	var contentType;
	if (req.url=="/") 
	{
		filename = "index.html";
		contentType = "text/html";
	}
	else if (req.url=="/style.css")
	{
		filename = "style.css";
		contentType = "text/css";
	}
	else 
	{
		res.statusCode = 404;
		res.end();
		return;
	}
	fs.readFile(filename, function(err, fdata) {
		if (err) {
			res.statusCode = 404;
			res.end();
			return;
		}
		send(res, fdata, contentType);
	});
});

server.listen(port, hostname, function(){
	console.log("Server running at http://"+hostname+":"+port+"/");
});
