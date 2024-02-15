Office.onReady(function() {
  $("#create").on("click", extractWords);
  var fileName = Office.context.document.url.split("\\").pop();
  console.log(fileName.replace(".docx", ""));
});

function extractWords() {
  Word.run(function(context) {
    var body = context.document.body;
    context.load(body, "text");

    return context.sync().then(function() {
      var wordsArray = body.text.match(/\b\w+\b/g);
      var filtered = wordsArray.filter((v, i) => wordsArray.indexOf(v) === i);
      var j = 0;
      var result = [];
      for (var i = 0; i < filtered.length; i++) {
        if (filtered[i].match(/\b[a-z]+\b/) && filtered[i].length > 2) {
          result[j] = filtered[i];
          j++;
        }
      }
      console.log(result);

      $.ajax({
        url: "http://127.0.0.1:3000/",
        type: "POST",
        data: { arrayData: result },
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