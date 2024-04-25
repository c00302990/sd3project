window.onload = function(){
	
	document.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	});

	document.getElementById('submit').addEventListener('click',showResult);
	document.getElementById("back").addEventListener("click", function(){
		history.back();
	});
};

function showResult(){
	let numCorrect = 0;
	const numberOfQuestions = document.getElementsByTagName('h2').length;
	const options = ['a','b','c','d'];
	var userAnswer = '';
	var correct = '';

	for(var i = 0; i < numberOfQuestions; i++){
		userAnswer = document.querySelector(`input[name=answer${i+1}]:checked`).value;
		correct = document.getElementsByName(`correct${i+1}`)[0].value;

		if(userAnswer === correct){
			numCorrect+=1;
			
			for(element of options){
				document.querySelector(`label[for="${element}_${i+1}"]`).style.color = 'lightgreen';
				document.getElementById(`${element}_${i+1}`).disabled = true;
			}
			
		} else{
			for(element of options){
				document.querySelector(`label[for="${element}_${i+1}"]`).style.color = 'red';
				document.getElementById(`${element}_${i+1}`).disabled = true;
			}
		}

	}
	
	document.getElementById('result').innerHTML = `${numCorrect} out of ${numberOfQuestions}`;
	document.getElementById('submit').disabled = true;
}