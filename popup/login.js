/* login.js */
//if no masterpw was set in local storage: init onboarding
var gettingMPW = browser.storage.local.get("mpw");
gettingMPW.then((results) => {
	var mpwHash = results["mpw"];
	if(mpwHash == null){
		initOnboarding();
	}else{
		initLogin();
	}
});

// show onboarding ui elements
function initOnboarding(){
	console.log("Function : initOnboarding");
	$('.onboarding').removeClass("hidden");
	//TODO check options
	var options = {};
	options.rules = {
		activated: {
			wordTwoCharacterClasses: true,
			wordRepetitions: true
		}
	};
	$('#inputCreateMPW').pwstrength(options);
	$('.progress').addClass("strength");
}

$('.onboarding a.btn-mp').click(function(){
	$('.onboarding').fadeOut().addClass('hidden');
	$('.onboarding_2').removeClass('hidden').fadeIn();
});

// show login ui elements
function initLogin(){
	console.log("Function : initLogin");
	$('.login').removeClass("hidden");
}


// example found at https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest 
function sha256(str) {
  // We transform the string into an arraybuffer.
  var buffer = new TextEncoder("utf-8").encode(str);
  return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
  	return hex(hash);
  });
}

function hex(buffer) {
	var hexCodes = [];
	var view = new DataView(buffer);
	for (var i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    var value = view.getUint32(i)
    // toString(16) will give the hex representation of the number without padding
    var stringValue = value.toString(16)
    // We use concatenation and slice for padding
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
}

  // Join all the hex strings into one
  return hexCodes.join("");
}

/*
sha256("foobar").then(function(digest) {
	console.log(digest);
}); // outputs "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
*/
