var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors());

const maria = require('./database/connect/maria');
maria.connect();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

const helmet = require('helmet');
app.use(helmet());

app.get('/', function (req, res) {
	var template = `
	<!DOCTYPE html>
	<html>
		<head>
			<title>Welcome!</title>
		</head>
	
		<body>
			<form action="" method="post">
				<p><input type="text" id="userId" placeholder="ID"></p>
				<p><input type="password" id="userPwd" placeholder="Password"></p>
				<p><input type="submit" value="login"></p>
			</form>
		</body>
	</html>
	`;
	res.send(template);
});

app.post('/create', function (req, res) {
	var received = req.body['arrayData[]'];
	var result = [];
	async function compareWords(){
		for(var word of received){
			await new Promise(function(resolve,reject){
				var sql = `SELECT * FROM words WHERE word='${word}';`;
				maria.query(sql, function(err, rows, fields){
					if(err){
						reject(err);
						return;
					}

					if(rows.length === 0){
						result.push(word);
					}

					resolve();
				});
			});
		}
		
		console.log(result);
	}

	compareWords();
});

app.use( function (req, res, next) {
	res.status(404).send('Not Found!');
});

app.use( function (err,req, res, next) {
	console.error(err.stack);
	res.status(500).send('Error!');
});

app.listen(8080, function () {
	console.log('Express app listening on port 8080!');
});