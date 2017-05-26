/* encode decode */ 
document.addEventListener('DOMContentLoaded', function(event){
	console.log(event + " DOMContentLoaded");
	
});

function encrypt(input){
	console.log("Function : encrypt");
	console.log("input: " + input);
	// return CryptoJS.AES.encrypt(input, "Secret Passphrase");
}

function decrypt(input){
	console.log("Function : decrypt");
	console.log("input: " + input);
	// return CryptoJS.AES.decrypt(input, "My Secret Passphrase");
}