const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const maria = require('./database/connect/maria');

require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
  }));

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(helmet());





// pick random words
function getRandom(result) {    
	const randomIndex = Math.floor(Math.random() * result.length);
	return result[randomIndex];
}




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


	</html>
	`;

	res.send(template);
});






app.post('/create', function (req, res, next) {
	var received = req.body['arrayData[]'];
	var tableName = req.body['name'];
	var numberOfQuestions = req.body['questions'];
	var result = [];
	var quizQuestion = [];
	

	async function compareWords(received, result){
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
		
	}

	
	compareWords(received,result).then(function (){
		var wordslist = [];	
		for(var i = 0; i<numberOfQuestions;i++){
			wordslist.push(getRandom(result));
		}

		async function runGPT35(wordslist) {
			const completion = await openai.chat.completions.create({
				messages: [
						{"role": "user", "content": `Create a question that ask the meaning of '${wordslist[0]}'. There are four possible answers to choose from, and there is only one correct answer.`},],
				model: "gpt-3.5-turbo-0125",
			});

			quizQuestion = completion.choices[0].content.split("\n");
			console.log(quizQuestion);
		}

		runGPT35(wordslist).then(function(){
			async function insert(result, quizQuestion){
				for(var e of quizQuestion){
					await new Promise(function(resolve,reject){
						maria.query(`INSERT INTO ${tableName} (word, used) VALUES ('${r}', 0);`, function(err, rows, fields){
							if(err){
								reject(err);
								return;
							}
							resolve();
						});
					});
				}		
			}
		});

		insert();

	});
	

	
	// async function main() {
	// 	const completion = await openai.chat.completions.create({
	// 		messages: [{"role": "system", "content": "You are an instructor who gives your students a vocabulary quiz."},],
	// 		messages: [{"role": "user", "content": "Create a quiz asking questions about the meaning of 'compulsory'. There are four possible answers to choose from, and there is only one correct answer."},],
	// 		model: "gpt-3.5-turbo",
	// 	});

	// 	console.log(completion.choices[0]);
	// }

	// main();
	
	
	

	// compareWords(received, result).then(function(){
	// 	maria.changeUser({database:'wordlist'},function(err){
	// 		if(err){ 
	// 			console.error(err);
	// 		}

	// 		else{
	// 			maria.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
	// 				no INT AUTO_INCREMENT,
	// 				word VARCHAR(30),
	// 				used TINYINT(1),
	// 				PRIMARY KEY(no)
	// 				);`, function(err, rows, fields){
	// 					// insert(result, tableName);
	// 					maria.query(`INSERT INTO ${tableName} (word, used) VALUES (?, 0);`, result);
						
	// 				});
	// 		}
	// 	});
	// });	
});


app.get('/student/quizz', function (req, res, next) {
	var template = `
			<p>
				<select>
					<option >Select...</option>
				</select>
			</p>
			<p>
				<button id="view">view</button>
			</p>`;
	
	res.send(template);
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