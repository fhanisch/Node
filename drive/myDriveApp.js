const https = require('https');
const url = require('url');
const fs = require('fs');

function readJsonFile(filename, cb)
{
	fs.readFile(filename, 'utf8', function(err, data){
		if (err) {
			console.log("Can't read file: " + filename);
			return;
		}
		if (cb) cb(JSON.parse(data));
	});
}

function writeJsonFile(filename, data, cb)
{
	fs.writeFile(filename, JSON.stringify(data,null,'\t'), function(err){
		if (err) {
			console.log("Can't write file: " + filename);
			return;
		}
	});
	if (cb) cb();
}

function httpRequest(options, body, cb)
{
	var req = https.request(options, res => {
		var responeBody = '';
		console.log("Status Code: " + res.statusCode);
		var contetntType = res.headers["content-type"];
		console.log("ContentType: " + contetntType);
	  
		res.on('data', (d) => {
			responeBody += d;
		});

		res.on('end', () => {
			//process.stdout.write(responeBody);
			if (contetntType.indexOf("json")>0) responeBody = JSON.parse(responeBody);
			cb(res.statusCode, responeBody);
		});
	});
	  
	req.on('error', error => {
		console.error(error);
	});
	
	if (body) req.write(body); //nur für POST requests
	req.end();
}

function generateAuthUrl()
{
	readJsonFile("apiSettings.json", function(data) {
		var scopes = data.SCOPES;
		console.log(scopes);
		readJsonFile("myCredentials.json", function(data) {
			console.log(data);
			//evtl. encodeURIComponent verwenden
			var url = data.installed.auth_uri + "?scope=" + encodeURIComponent(scopes[0]) + "%20" + encodeURIComponent(scopes[1]) + "%20" + encodeURIComponent(scopes[2]) + "&response_type=code&redirect_uri=" + data.installed.redirect_uris[0] + "&client_id=" + data.installed.client_id;
			console.log(url);
		});
	});
}

function getAccessToken(code)
{
	readJsonFile("myCredentials.json", function(data){
		console.log(data);
		var q = url.parse(data.installed.token_uri, true);
		console.log(q);
		//evtl. encodeURIComponent verwenden
		var requestBody = "code=" + code + "&client_id=" + data.installed.client_id + "&client_secret=" + data.installed.client_secret + "&redirect_uri=" + data.installed.redirect_uris[0] + "&grant_type=authorization_code";
		console.log(requestBody);

		var options = {
			hostname: q.hostname,
			port: 443,
			path: q.path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': requestBody.length
			}
		}

		httpRequest(options, requestBody, function(statusCode, data){
			console.log("\n"+statusCode);
			console.log(data);
			if (statusCode == 200) writeJsonFile("token.json", data);
		});
	});
}

function refreshToken()
{
	return new Promise(function(resolve,reject){
		console.log("Refresh Token:");
		readJsonFile("myCredentials.json", function(data) {
			var credentials = data.installed;
			readJsonFile("token.json", function(data) {
				var token = data;
				var q = url.parse(credentials.token_uri, true);
				//console.log(q);
				//evtl. encodeURIComponent verwenden
				var requestBody = "client_id=" + credentials.client_id + "&client_secret=" + credentials.client_secret + "&refresh_token=" + token.refresh_token + "&grant_type=refresh_token";
				console.log(requestBody);

				var options = {
					hostname: q.hostname,
					port: 443,
					path: q.path,
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': requestBody.length
					}
				}

				httpRequest(options, requestBody, function(statusCode, data){
					console.log(data);
					token.access_token = data.access_token;
					if (statusCode == 200) writeJsonFile("token.json", token, function(){
						resolve("Token refreshed.");
					});
					else console.log("Refresh Token failed!");
				});
			});
		});
	});
}

function listFiles(fileID, queryTerm)
{
	return new Promise(function(resolve,reject){
		if (!fileID) {
			fileID = '';
			var fieldString = 'fields=files(id,name,mimeType,kind,createdTime)&';
		}
		else {
			fileID = '/' + fileID;
			var fieldString = 'fields=id,name,mimeType,kind,createdTime&';
		}
		if(!queryTerm) queryString = '';
		else queryString = 'q=' + encodeURIComponent(queryTerm) + "&";
		console.log("List Files:");
		readJsonFile("apiSettings.json", function(data) {
			var apiKey = data.api_key;
			readJsonFile("token.json", function(data) {
				console.log(apiKey);
				console.log(data.access_token);
				var options = {
					hostname: 'www.googleapis.com',
					port: 443,
					path: '/drive/v3/files' + fileID + '?' + queryString + fieldString + 'key=' + apiKey,
					method: 'GET',
					headers: {'Authorization': 'Bearer ' + data.access_token, 'Accept': 'application/json'}
				}
				httpRequest(options, null, function(statusCode, data) {
					if (statusCode == 200) {
						resolve(data);
					}
					else {
						reject(data);
					}
				});
			});
		});
	});
}

function getFile(fileID)
{
	return new Promise(function(resolve, rejected){
		console.log("Get File:");
		readJsonFile("apiSettings.json", function(data) {
			var apiKey = data.api_key;
			readJsonFile("token.json", function(data) {
				console.log(apiKey);
				console.log(data.access_token);
				var options = {
					hostname: 'www.googleapis.com',
					port: 443,
					path: '/drive/v3/files/' + fileID + '?key=' + apiKey + "&alt=media",
					method: 'GET',
					headers: {'Authorization': 'Bearer ' + data.access_token, 'Accept': 'application/json'} //TODO: Accept-Format checken!
				}
				httpRequest(options, null, function(statusCode, data){
					if (statusCode == 200) {
						resolve(data);
					}
					else {
						reject(data);
					}
				});
			});
		});
	});
}

function uploadFile(filename, folderID)
{
	return new Promise(function(resolve){
		console.log("Upload File:");
		readJsonFile(filename, function(data) {
			var fileContent = JSON.stringify(data);
			var strParts = filename.split(/\\|\//);
			readJsonFile("apiSettings.json", function(data) {
				var apiKey = data.api_key;
				readJsonFile("token.json", function(data) {
					console.log(apiKey);
					console.log(data.access_token);
					var metadata = JSON.stringify({ "name": strParts.pop(), "parents": [folderID]});
					var requestBody = "";
					requestBody += "--foo_bar_baz\n";
					requestBody += "Content-Type: application/json; charset=UTF-8\n\n";
					requestBody += metadata + "\n\n";
					requestBody += "--foo_bar_baz\n";
					requestBody += "Content-Type: application/json; charset=UTF-8\n\n";
					requestBody += fileContent + "\n";
					requestBody += "--foo_bar_baz--\n";
		
					var options = {
						hostname: 'www.googleapis.com',
						port: 443,
						path: '/upload/drive/v3/files' + '?key=' + apiKey + '&uploadType=multipart',
						method: 'POST',
						headers: {
							'Content-Type': 'multipart/related; boundary=foo_bar_baz',
							'Content-Length': requestBody.length,
							'Authorization': 'Bearer ' + data.access_token,
							'Accept': 'application/json'
						}
					}
					httpRequest(options, requestBody, function(statusCode, data){
						resolve(data);
					});
				});
			});
		});
	});
}

async function parseArguments(args)
{
	var reuslt;
	for (i=0;i<myArgs.length;i++) {

		if (myArgs[i] == "-a") generateAuthUrl();
		else if (myArgs[i] == "-t") {
			if (i == myArgs.length-1){
				console.log("No code input!");
				process.exit(1);
			}
			else {
				console.log(myArgs[i+1]);
				getAccessToken(myArgs[i+1]);
				i++;
			}
		}
		else if (myArgs[i] == "-r") {
			result = await refreshToken();
			console.log(result);
		}
		else if (myArgs[i] == "-l") 
		{
			if (i == myArgs.length-1) {
				//result = await listFiles(null, null);
				try {
					result = await listFiles(null, "name='Documente' and mimeType='application/vnd.google-apps.folder'");
					console.log(result);
				}
				catch(err) {
					console.log(err);
					if (err.error.message == "Invalid Credentials") {
						result = await refreshToken();
						console.log(result);
						result = await listFiles(null, "name='Documente' and mimeType='application/vnd.google-apps.folder'");
						console.log(result);
					}
					else {
						process.exit(1);
					}
				}
				result = await listFiles(null, "'" + result.files[0].id + "'" + " in parents");
				console.log(result);
				result = await listFiles(result.files[0].id, null);
				console.log(result);
			}
			/*else {
				var next = myArgs[i+1];
				if (next[0] != '-') {
					listFiles(myArgs[i+1], null);
					i++;
				} 
				else listFiles(null, null);
			}*/
		}
		else if (myArgs[i] == "-f") {
			if (i == myArgs.length-1) {
				console.log("No filename input!");
				process.exit(1);
			}
			else
			{
				var fileName = myArgs[i+1];
				if (fileName[0] == '-') {
					console.log("No filename input!");
					process.exit(1);
				}
				result = await listFiles(null, "name='Documente' and mimeType='application/vnd.google-apps.folder'");
				result = await listFiles(null, "'" + result.files[0].id + "'" + " in parents and name='" + fileName + "'");
				console.log(result);
				result = await getFile(result.files[0].id);
				console.log(result);
				i++;
			}
		}
		else if (myArgs[i] == "-u") {
			if (i == myArgs.length-1) {
				console.log("No file input!");
				process.exit(1);
			}
			else {
				var file = myArgs[i+1];
				console.log(file);
				if (file[0] == '-') {
					console.log("No file input!");
					process.exit(1);
				}
				result = await listFiles(null, "name='Documente' and mimeType='application/vnd.google-apps.folder'");
				result = await uploadFile(file, result.files[0].id);
				console.log(result);
				i++;
			}
		}
		else console.log("Unknown argument!");
	
	}
}

/* main */
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

if (myArgs.length == 0) {
	console.log("No input arguments!");
	process.exit(1);
}

parseArguments(myArgs);

console.log("Hihi");
