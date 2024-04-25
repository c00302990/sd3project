window.onload = function(){
    document.getElementById("delete").addEventListener("click", function(){
	    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
        var values = [];
        for (var i = 0; i < checkboxes.length; i++) {
            values.push(checkboxes[i].value);
        }

        var deleteConfirm = confirm("Are you sure you want to delete?");
        if(deleteConfirm){
            $.ajax({
                url: "/quiz/deleteQuestions",
                type: "post",
                data: JSON.stringify({ quizName: document.title.split(" - ")[0], targetWords: values }),
                contentType: "application/json",
                success: function(response) {
                    console.log("success");
                },
                error: function(error) {
                console.error(error);
                }
            });

            setTimeout(()=>{ 
                location.reload();
                alert("The selected question have been deleted!");
             }, 10000);
        }
	});

    document.getElementById('add').addEventListener('click', function() {
        var word = document.getElementById('addWord').value;
        if (word.trim() !== '') {
            var listItem = document.createElement('li');
            listItem.textContent = word;
            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.addEventListener('click', function() {
                listItem.remove();
            });
            
            listItem.appendChild(deleteButton);
            document.getElementById('wordList').appendChild(listItem);
            document.getElementById('addWord').value = '';
        }
    });

    document.getElementById('create').addEventListener('click', function() {
        var listItems = document.getElementById("wordList").querySelectorAll("li");
        var addedWords = [];
        listItems.forEach(function(item) {
            var textNode = item.childNodes[0];
            if (textNode.nodeType === Node.TEXT_NODE) {
                addedWords.push(textNode.textContent);
            }
        });

        $.ajax({
            url: "/quiz/createQuestions",
            type: "post",
            data: JSON.stringify({ quizName: document.title.split(" - ")[0], addedWords: addedWords }),
            contentType: "application/json",
            success: function(response) {
              console.log("success");
            },
            error: function(error) {
              console.error(error);
            }
          });

        setTimeout(()=>{ 
            location.reload();
            alert("Questions have been created!");
        }, 10000);
    });
};
