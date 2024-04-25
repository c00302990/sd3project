const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const path = require('path');
app.use(express.static('public'));

const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', './views');

const maria = require('./database/connect/maria');

const functions = require('./functions');


app.get('/', function (req,res,next) {
	res.sendFile(path.join(__dirname, '/public/html/index.html'));
});


app.get('/registration', function (req,res,next) {
	res.sendFile(path.join(__dirname, '/public/html/registration.html'));
});


app.post('/create', function (req, res, next) {
	var received = req.body['arrayData'];
	var tableName = req.body['name'];
	var numberOfQuestions = req.body['questions'];
	var result = [];
	var exclude = [];
	var quizQuestion = [];
	
	maria.changeUser({database:'wordFrequency'},function(err){
		if(err){ 
			console.error(err);
		}
	});

	functions.compareWords(received,result,exclude).then(function (){
		var wordlist = [];
		for(var i = 0; i<numberOfQuestions;i++){
			wordlist.push(result[i].word);
		}
		
		maria.changeUser({database:'quizlist'},function(err){
			if(err){ 
				console.error(err);
			}

			else{
				maria.query(`DROP TABLE IF EXISTS ${tableName};`);
				for(word of wordlist){
					functions.runGPT35(word, quizQuestion).then(function(){
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
						functions.insert(quizQuestion, tableName);
					});
				}
			}
		});
	});
});


app.get('/quizlist', async function(req, res, next){
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			maria.query('SHOW TABLES', function(err, rows){
				if (err) throw err;
				var quizlist = [];
				rows.forEach(row => {
					quizlist.push(row['Tables_in_quizlist']);
				});

				res.json(quizlist);
			});
		}
	});
});


app.post('/delete', async function(req, res, next){
	var deleteQuiz = req.body.delete;
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			maria.query(`DROP TABLES ${deleteQuiz};`, function(err, rows){
				if (err) throw err;
			});
		}
	});
});


app.get('/student/quiz', function (req, res, next) {
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
				
				res.render('selectQuiz', { optionList: quizlist});
			});
		}
	});
});


app.post("/student/quiz/start", function(req,res,next){
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			maria.query(`SELECT * FROM ${req.body['quizList']};`, function(err, result){
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


app.get('/quiz/:quizName', function(req,res,next){
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			maria.query(`SELECT * FROM ${req.params.quizName};`, function(err, result){
				
				var quizQuestion = [];
				var usedWords = [];
				
				if (err) throw err;

				var pattern =/"([^"]*)"|'([^']*)'/g;

				result.forEach(result => {
					var usedWord = result.question.match(pattern)[0];
					usedWords.push(usedWord.substring(1,usedWord.length-1));

					var quizSet = {
						question: (result.question.includes(": "))?result.question.split(": ")[1]:result.question.split(": ")[0],
						optionA: result.optionA,
						optionB: result.optionB,
						optionC: result.optionC,
						optionD: result.optionD,
						correct: (result.correct.includes(": "))?result.correct.split(": ")[1]:result.correct.split(": ")[0],
						checkboxVal: result.no
					};
					quizQuestion.push(quizSet);
					
				});
				
				res.render('quiz_instructor', {title: req.params.quizName+' - instructor page', data: quizQuestion, usedWords: usedWords});
			});
		}
	});
});


app.post('/quiz/deleteQuestions', async function (req, res, next){
	var targetQuiz = req.body.quizName;
	var deleteQuestions = req.body.targetWords;
	maria.changeUser({database:'quizlist'},function(err){
		if(err){ 
			console.error(err);
		}

		else{
			for(var i=0; i<deleteQuestions.length; i++){
				maria.query(`DELETE FROM ${targetQuiz} WHERE no = '${deleteQuestions[i]}';`, function(err, rows){
					if (err) throw err;
				});
			}
		}
	});
});


app.post('/quiz/createQuestions', async function (req, res, next){
	var targetQuiz = req.body.quizName;
	var createQuestions = req.body.addedWords;
	var quizQuestion = [];

	maria.changeUser({database:'quizlist'},async function(err){
		if(err){ 
			console.error(err);
		}

		else{
            for (var word of createQuestions) {
				functions.runGPT35(word, quizQuestion).then(function(){ functions.insert(quizQuestion, targetQuiz);});
            }
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

app.listen(process.env.PORT, function () {});