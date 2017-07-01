function onLogin(){
	var email = document.getElementById('username').value;
	console.log("herre in js");
	if (email.length < 4) {
		document.getElementById('error').innerHtml = "<div class=\"alert alert-danger\"><p id=\"error\">Please Enter Valid Email</p></div>";
		return false;
	} return true;
}