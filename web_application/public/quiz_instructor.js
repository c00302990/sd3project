window.onload = function(){

    document.getElementById("delete").addEventListener("click", function(){
	    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
        for (var i = 0; i < checkboxes.length; i++) {
            console.log(checkboxes[i].value);
        }
	});
    
};