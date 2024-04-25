const maria = require('./database/connect/maria');

require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});


module.exports = {
    compareWords: async function compareWords(received, result, exclude){
        for(var word of received){
            await new Promise(function(resolve,reject){
                var sql = `SELECT * FROM words WHERE word='${word}';`;
    
                maria.query(sql, function(err, rows){
                    if(err){
                        reject(err);
                        return;
                    }
    
                    if(rows.length > 0){
                        result.push({ rank:rows[0].rank, word:rows[0].word});
                    } else{
                        exclude.push(word);
                    }
                    
                    resolve();
                });
            });
            
        }
        
        result.sort((a,b) => b.rank - a.rank);
    },
    
    runGPT35: async function runGPT35(word,quizQuestion) {
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
	},

    insert: async function insert(quizQuestion, tableName){
		await new Promise(function(resolve,reject){
			maria.query(`INSERT INTO ${tableName} (question, optionA, optionB, optionC, optionD, correct) VALUES (?,?,?,?,?,?);`, quizQuestion, function(err){
				if(err){
					reject(err);
					return;
				}
				resolve();
			});
           quizQuestion.length = 0;
		});
	}
  }