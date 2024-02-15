const express = require('express')
const app = express()

app.get('/', (req, res) => res.send("Hello World!"))
app.listen(3000, ()=>console.log('Express app listening on port 3000!'))

/*var http = require('http');
var fs = require('fs');
var url = require('url');

var qs = require('querystring');

var app = http.createServer(function(request,response){
	var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	if(pathname === '/'){
		var template = `
			<!DOCTYPE html>
			<html>
				<head>
					<title></title>
				</head>
		
				<body>
					TEST!
					<div></div>
				</body>
			</html>
		`

		response.writeHead(200);
		response.end(template);
	} else {
		response.writeHead(404);
		response.end('Not found');
	}

	
	var body = '';
	request.on('data', function(data){
		body = body + data;
	});

	request.on('end', function(){
		var post = qs.parse(body);
		console.log(post);
		//console.log(post['arrayData[]']);
	});

});

app.listen(3000);*/