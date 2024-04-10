const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const maria = require('./database/connect/maria');

const ejs = require('ejs');

app.set('view engine', 'ejs');
app.set('views', './views');

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

app.use(express.static('public'));



// pick random words
function getRandom(result) {    
	const randomIndex = Math.floor(Math.random() * result.length);
	return result[randomIndex];
}



app.get('/', function (req,res,next) {
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






app.post('/create', function (req) {
	var received = req.body['arrayData[]'];
	var tableName = req.body['name'];
	var numberOfQuestions = req.body['questions'];
	var result = [];
	var quizQuestion = [];
	
	maria.changeUser({database:'wordFrequency'},function(err){
		if(err){ 
			console.error(err);
		}
	});

	async function compareWords(received, result){
		for(var word of received){
			await new Promise(function(resolve,reject){
				var sql = `SELECT * FROM words WHERE word='${word}';`;
	
				maria.query(sql, function(err, rows){
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

	async function runGPT35(word) {
		const completion = await openai.chat.completions.create({
			messages: [
					{"role": "user", "content": `Create a question that ask the meaning of '${word}'. There are four possible answers to choose from, and there is only one correct answer.
					At the end, show the correct answer of the question.`},],
			model: "gpt-3.5-turbo-0125",
		});
	
		var result = completion.choices[0].message.content.split("\n");
		
		result.filter((str) => {
			if(str.trim() !== ""){
				quizQuestion.push(str);
			}
		});
	}

	async function insert(quizQuestion){
		await new Promise(function(resolve,reject){
			maria.query(`INSERT INTO ${tableName} (question, optionA, optionB, optionC, optionD, correct) VALUES (?,?,?,?,?,?);`, quizQuestion, function(err){
				if(err){
					reject(err);
					return;
				}
				resolve();
			});
		});
	}


	compareWords(received,result).then(function (){
		var wordlist = [];	
		for(var i = 0; i<numberOfQuestions;i++){
			wordlist.push(getRandom(result));
		}

		maria.changeUser({database:'quizlist'},function(err){
			if(err){ 
				console.error(err);
			}

			else{
				for(word of wordlist){
					runGPT35(word).then(function(){
						maria.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
							no INT AUTO_INCREMENT PRIMARY KEY,
							question VARCHAR(255),
							optionA VARCHAR(255),
							optionB VARCHAR(255),
							optionC VARCHAR(255),
							optionD VARCHAR(255),
							correct VARCHAR(255)
							);`);
					}).then(function(){
						maria.query(`DELETE FROM ${tableName};`,function(){
							insert(quizQuestion);
							quizQuestion = [];
						});
					});
				}
			}
		});
	
	});
});


app.get('/student/quizz', function (req, res, next) {

	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			maria.query('SHOW TABLES', function(err, result){
				if (err) throw err;
				var quizlist = [];
				result.forEach(row => {
					quizlist.push(row['Tables_in_quizlist']);
				});

				var option = `<option>Select...</option>`
				quizlist.forEach((quiz) => {
					option += `<option value="${quiz}">${quiz}</option>`
				});
				
				var template = `
							<!DOCTYPE html>
							<html>
								<head>
									<title>Select Quiz</title>
								</head>
							<body>
								<h2> Select Quiz </h2> <hr>
								<form action="/student/quizz/start" method="post">
									<p>
										<select name="quiz">
											${option}
										</select>
									</p>
									<p>
										<button>Start</button>
									</p>
								</form>
							</body>	
								`;
	
				res.send(template);
			});

		}
	});


	
});



app.post("/student/quizz/start", function(req,res,next){
	
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			
			maria.query('SELECT * FROM test', function(err, result){
				
				var quizQuestion = [];
				
				if (err) throw err;

				result.forEach(result => {
					var quizSet = {
						question: (result.question.includes(": "))?result.question.split(": ")[1]:result.question.split(": ")[0],
						optionA: result.optionA,
						optionB: result.optionB,
						optionC: result.optionC,
						optionD: result.optionD,
						correct: (result.correct.includes(": "))?result.correct.split(": ")[1]:result.correct.split(": ")[0]
					};
					quizQuestion.push(quizSet);
				});
				
				res.render('quiz', {title: req.body.quiz, data: quizQuestion,});
			});

		}
	});
	
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