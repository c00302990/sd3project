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

/*
const {GoogleGenerativeAI} = require('@google/generative-ai');
process.env.API_KEY = 'AIzaSyCbYRFhSVuOCbaE6-fTptVpmc_XvAAYU-s';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


async function run() {
	const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
	const prompt = "Write a story about a magic backpack."
  
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();
	console.log(text);
}
  
run(); */



app.get('/', function (req, res) {
	var template = `
	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Security-Policy" content="script-src 'self' https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js;">
		<!--<script type="text/javascript" src="https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js"></script>
		<script type="text/javascript" src="https://code.jquery.com/jquery-3.7.1.js"></script>-->
	</head>
	
	<body>
		<H1>Quizzes</H1>
		<main>
	
			<p>
				<button id="create">create</button>
			</p>

			<p>
				<select>

				</select>
			</p>
			<p>
				<button id="view">view</button>&nbsp;&nbsp;<button id="delete">delete</button>
			</p>
			
		</main>
	</body>
	</html>
	`; 
	/*`
	<!DOCTYPE html>
	<html>
		<head>
			<title>Welcome!</title>
			
		</head>
	
		<body>
			<form action="" method="post">
				<p><input type="text" id="userId" placeholder="ID"></p>
				<p><input type="password" id="userPwd" placeholder="Password"></p>
				<input type="submit" value="login">
			</form>
			<button onclick="moveToRegisterPage()">register</button>
			<p><a href="">forget your id or password?</a></p>
		</body>

		<script>
			function moveToRegisterPage(){
				
			}
		</script>

	</html>
	`;*/


	res.send(template);
});


app.post('/create', function (req, res) {
	var received = req.body['arrayData[]'];
	var excluded = ['is','an'];
	var result = [];
	async function compareWords(){
		for(var word of received){
			if(!excluded.includes(word)){
				await new Promise(function(resolve,reject){
					var sql = `SELECT * 
								FROM words
								WHERE word='${word}' OR word='${word.slice(0,word.length-1)}'
													 OR word='${word.slice(0,word.length-2)}'
													 OR word='${word.slice(0,word.length-3)}';`;
				
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
			
		}

		maria.changeUser({database:'test1'},function(err){
			if(err){
				console.error(err);
			}
			
		});

		var tableName = req.body['name'];
		var createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
			no INT AUTO_INCREMENT,
			word VARCHAR(30),
			PRIMARY KEY(no)
			);`;


		maria.query(createSQL, function(err, rows, fields){
			async function insert(){
				for(var r of result){
					await new Promise(function(resolve,reject){
						var sql = `INSERT INTO ${tableName} (word) VALUES ('${r}')`;
						
							maria.query(sql, function(err, rows, fields){
								if(err){
									reject(err);
									return;
								}
			
								resolve();
							});
						});
					}
					
				}

			insert();
		});
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