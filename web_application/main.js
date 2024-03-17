const express = require('express');
const app = express();
// const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const maria = require('./database/connect/maria');

require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// app.use(session({
// 	secret: 'keyboard cat',
// 	resave: false,
// 	saveUninitialized: true,
//   }));

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(helmet());


// async function compareWords(received, result){
// 	for(var word of received){
// 		await new Promise(function(resolve,reject){
// 			maria.query(`SELECT * FROM words WHERE word='${word}';`, function(err, rows, fields){
// 				if(rows.length > 0){
// 					result.push(word);
// 				}
// 			});	
// 			resolve();
// 		});
// 	}
// }

async function compareWords(received, result){
	await Promise.all(received.map(async (word) => {
		const rows = await maria.promise().query(`SELECT * FROM words WHERE word='${word}';`);
		if(rows.length > 0){
			result.push(word);
		}
	}));
}


// async function insert(result, tableName){
// 	for(var r of result){
// 		await new Promise(function(resolve,reject){
// 			maria.query(`INSERT INTO ${tableName} (word, used) VALUES ('${r}', 0);`, function(err, rows, fields){
// 				if(err){
// 					reject(err);
// 					return;
// 				}
// 				resolve();
// 			});
// 		});
// 	}		
// }



function getRandom() {    
	const randomIndex = Math.floor(Math.random() * weather.length);
	return weather[randomIndex];
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
	
	compareWords(received, result);
	console.log(result);
	

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

app.get('/quizz', function (req, res, next) {
	
});




app.get('/generate',function (req, res){
	
	async function main() {
		const completion = await openai.chat.completions.create({
			messages: [{"role": "system", "content": "You are a helpful assistant."},],
			messages: [{"role": "user", "content": "Create a quiz asking questions about the meaning of 'compulsory'. There are four possible answers to choose from, and there is only one correct answer."},],
			model: "gpt-3.5-turbo",
		});

		console.log(completion.choices[0]);
	}

	main();
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