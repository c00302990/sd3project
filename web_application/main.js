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

// require('dotenv').config();


// const { OpenAI } = require("openai");
// const openai = new OpenAI({
// 	apiKey: process.env.OPENAI_API_KEY,
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{"role": "system", "content": "You are a helpful assistant."},],
//     model: "gpt-3.5-turbo",
//   });

//   console.log(completion.choices[0]);
// }

// main();

app.get('/', function (req, res) {
	var template = 
	`
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

<!--	<script>
			function moveToRegisterPage(){
				
			}
		</script>	-->

	</html>
	`;


	res.send(template);
});


app.post('/create', function (req, res) {
	var received = req.body['arrayData[]'];
	var tableName = req.body['name'];
	var numberOfQuestions = req.body['questions'];
	
	var result = [];
	async function compareWords(){
		for(var word of received){
			await new Promise(function(resolve,reject){
				var sql = `SELECT * 
							FROM words
							WHERE word='${word}';`;
			
				maria.query(sql, function(err, rows, fields){
					if(err){
						reject(err);
						return;
					}

					if(rows.length > 0){
						result.push(word);
					}

					resolve();
				});
			});
		}

		maria.changeUser({database:'wordlist'},function(err){
			if(err){
				console.error(err);
			}
		});

		
		var createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
			no INT AUTO_INCREMENT,
			word VARCHAR(30),
			used BIT,
			PRIMARY KEY(no)
			);`;


		maria.query(createSQL, function(err, rows, fields){
			async function insert(){
				for(var r of result){
					await new Promise(function(resolve,reject){
						var sql = `INSERT INTO ${tableName} (word, used) VALUES ('${r}', 0)`;
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