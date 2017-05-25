/* encode decode */ 
document.addEventListener('DOMContentLoaded', function(event){
	console.log(event + " DOMContentLoaded");
	var s=document.createElement('script');
	s.src='https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/aes.js';
	document.body.appendChild(s);
});

function encrypt(input){
	console.log("Function : encrypt");
	console.log("input: " + input);
	return CryptoJS.AES.encrypt(input, "Secret Passphrase");
}

function decrypt(input){
	console.log("Function : decrypt");
	console.log("input: " + input);
	return CryptoJS.AES.decrypt(input, "My Secret Passphrase");
}