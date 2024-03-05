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
  })
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
         
      console.log(result);
            
    
      $.ajax({
        url: "http://127.0.0.1:8080/create",
        type: "POST",
        data: { arrayData: result, name: fileName, questions: numberOfQuestions },
        success: function(response) {
          console.log("success");
        },
        error: function(error) {
          console.error(error);
        }
      });
      

    });
  }).catch(function(error) {
    console.log(error);
  });
}