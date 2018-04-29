var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var dt = require('./mymodule');

var person = new Person('Wanda','Niere',31);
console.log(person.getFullName());

console.log("Server started...\n");
http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log(req.method);
    console.log(req.url);
    console.log(q);
    //console.log(qdata);
    
    if (q.pathname == "/command")
    {
        if (req.method == 'POST') {
            var body = '';
    
            req.on('data', function (data) {
                body += data;
            });
    
            req.on('end', function () {
                console.log(body);
                send(res,"ok",'text/html');
            });
        }
        else if (qdata.method == "gettext")
        {
            var data = "<p>HalliHallo<p>";
            data += "<p>"+dt.myDateTime()+"</p>";
            data += "<p>"+add(7,3)+"</p>";
            data += "<p>"+q.pathname+"</p>";
            data += "<p>"+qdata.method+"</p>";
            send(res,data,'text/html');
        }
        else
        {
            send(res,"nix da");
        }
    }
    else
    {
        var filename = "." + q.pathname;
        if (filename == "./") filename = "./index.html";
        var extname = String(path.extname(filename)).toLowerCase();
        var mimeTypes = {
            '.html': 'text/html',
            '.txt': 'text/plain',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.ico': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.svg': 'application/image/svg+xml'
        };
        var contentType = mimeTypes[extname] || 'application/octet-stream';
        console.log(extname);
        console.log(contentType);
        fs.readFile(filename, function(err, fdata) {
            if (err) {
                send(res,"<h1>What!</h1>");
                return;
            }
            send(res, fdata, contentType);
        });
    }
}).listen(3000);

function send(res, buf, contentType)
{
    res.writeHead(200, {'Content-Type': contentType});
    res.write(buf);
    res.end();
}

function add(a,b)
{
    return a+b;
}

function Person(prename,name,age)
{
    this.name = name;
    this.prename = prename;
    this.age = age;
    this.getFullName = function(){return this.prename + " " + this.name};
}