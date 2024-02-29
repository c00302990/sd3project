Office.onReady(function() {
  $(document).ready(()=>{
    
    $("#create").on("click", extractWords);

  })
});

async function extractWords() {
  await Word.run(function(context) {
    var fileName = Office.context.document.url.split("\\").pop().replace(".docx", "");

    var body = context.document.body;
    body.load("text");

    return context.sync().then(function() {
      var wordsArr = body.text.toLocaleLowerCase().split(/\s+/);
      var filtered = [];
      var specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
      wordsArr.forEach(function(element){
      if (element[0] == "'" && element[element.length - 1] == "'"){
      } else if (specialChar.test(element)){
        element = element.replace(/[^a-z]/g, '');
        if(element.length > 1 && element.match(/[a-z]/)){
          filtered.push(element);
        }
      } else{
        if (element.length > 1 && element.match(/[a-z]/)){
          filtered.push(element);
        }
      }
    });

    var uniqueArr = new Set(filtered);
      console.log(uniqueArr);
      
      $.ajax({
        url: "http://127.0.0.1:8080/create",
        type: "POST",
        data: { arrayData: result, name: fileName },
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