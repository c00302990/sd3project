Office.onReady(function() {
  $(document).ready(()=>{
    $("#create").on("click", function(){
      var numberOfQuestions = $("input[name=numberOfQuestions]").val();
      if(numberOfQuestions > 0){

        var dialog = document.getElementById("success");
        extractWords(numberOfQuestions);
        dialog.showModal(); 

      } else{
        var dialog = document.getElementById("error");
        dialog.showModal();
      }
      
      for( var i = 0; i < document.getElementsByClassName("close").length; i++ ){
				document.getElementsByClassName("close").item(i).addEventListener("click", function(){
          dialog.close();
        });
			}

    });

    $("#reload").on("click", function(){
      fetch('https://sd3project.nw.r.appspot.com/quizlist')
        .then(response => response.json())
        .then(data => {
          const quizList = document.getElementById('quizlist');
          quizList.innerHTML = '';
          data.forEach(table => {
            const option = document.createElement('option');
            option.textContent = table;
            option.setAttribute('value',table);
            quizList.appendChild(option);
          });
        })
        .catch(error => console.error('Error:', error));
    });
  
    $("#open").on("click", function(){
      const openQuiz = document.getElementById('quizlist').value;
      window.open('https://sd3project.nw.r.appspot.com/quiz/'+openQuiz, '_blank');
    });

    $("#delete").on("click", function(){
      $.ajax({
        url: "https://sd3project.nw.r.appspot.com/delete",
        type: "post",
        data: JSON.stringify({ delete: document.getElementById('quizlist').value }),
        contentType: "application/json",
        success: function(response) {
          console.log("success");
        },
        error: function(error) {
          console.error(error);
        }
      });
    });
  });
});


async function extractWords(numberOfQuestions) {
  await Word.run(function(context) {
      var fileName = Office.context.document.url.split("\\").pop().replace(".docx", "");
      var body = context.document.body;
      body.load("text");

      return context.sync().then(function() {
        var wordsArr = body.text.toLocaleLowerCase().match(/\b\w+\b/g);
        var result = [];

        for (var word of wordsArr) {
          if (word.match(/\D+/) && word.length > 1) {   
            if(!result.includes(word)){
              result.push(word);
            } 
         }
        }
      

      fetch('https://sd3project.nw.r.appspot.com/create', {
        mode: 'no-cors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://localhost:3000/'
        },
        body: JSON.stringify({ arrayData: result, name: fileName, questions: numberOfQuestions })
      })
      .then(response => {
        if (response.ok) {
          console.log('success');
        } else {
          console.error('failed');
        }
      })
      .catch(error => console.error(error));
    
    });
  }).catch(function(error) {
    console.log(error);
  });
}