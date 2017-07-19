/* login.js */
$(document).ready(function() {
	$.material.init();
	//if no rsa key pair was set in local storage: init onboarding
	var getting = browser.storage.local.get("rsa_enc");
	getting.then((results) => {
		if(results["rsa_enc"] == null){
			initOnboarding();
		}else{
			openManager();
		}
	});

});

// show onboarding ui elements
function initOnboarding(){
	// set webexID for Logging
	browser.storage.local.set({"webexID" : "123456789"});
	
	var slide = 0;
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
	$('#inputCreateMPW').on('keyup', function(event) {
		if($(this).val().length > 0){
			$('.progress').show();
			$('.password-verdict').show();
			$('.onboarding a.btn-mp').show();
		}else{
			$('.progress').hide();
			$('.password-verdict').hide();
			$('.onboarding a.btn-mp').hide();
		}
	});
	$('#inputCreateMPW').pwstrength(options);
	$('.progress').addClass("strength");
	$('.progress').hide();
	$('.onboarding a.btn-mp').hide();
	$('.password-verdict').hide();
	$('#next .material-icons').on('click', function(){	
		if(++slide == $('.slide').length-1){
			$('.slide').animate({"left": "-=600"}, 500);
			$('#next').fadeOut();
		}else{
			$('.slide').animate({"left": "-=600"}, 500);
		}
	});
	$('#btnOpenManager').on('click', function(){
		var mode = $('input:radio:checked').val();
		// console.log(mode);
		browser.storage.local.set({'mode' : mode});
		openManager();
	});
	
}

function openManager(){
	var gettingAllWindows = browser.windows.getAll();
	gettingAllWindows.then(function(aRes){
		var gettingCurrent = browser.windows.getCurrent();
		gettingCurrent.then(function(cRes){
			for (var i = 0; i < aRes.length; i++) {
				if(aRes.length == 1){
					// console.log("length: 1");
					var removing = browser.windows.remove(cRes.id);
					var creatingWindow = browser.windows.create({
						"url": chrome.extension.getURL("background/background.html"),
						"state": "maximized"
					});
				}else{
					if(aRes[i].id != cRes.id && aRes[i].type == "normal"){
					//no other window is opened -> open in new window

					//close self and open in any other opened window as a tab
					var removing = browser.windows.remove(cRes.id);
					var createTab = chrome.tabs.create({
						"url": chrome.extension.getURL("background/background.html"),
						"windowId": aRes[i].id,
					});
					createTab.then(function(){
						browser.windows.update(aRes[i].id,{"focused":true})
					});

				}
			}
		}		
	});
	});
}

$(document).keypress(function(e) {
	if(e.which == 13) {
		e.preventDefault();
		if(!$('.onboarding').hasClass('hidden')){
			var mpw = $('#inputCreateMPW').val();
			//store mpw (deleted after check)
			// console.log(CryptoJS.SHA512(mpw).toString());
			browser.storage.local.set({"mpw" : CryptoJS.SHA512(mpw).toString()});
			$('.onboarding').fadeOut().addClass('hidden');
			$('.onboarding_2').removeClass('hidden').fadeIn();
		}else{
			var mpwr = CryptoJS.SHA512($('#inputConfirmMPW').val()).toString();
			// console.log(mpwr);
			var mpw = $('#inputConfirmMPW').val();

			doubleCheckMPW(mpwr,
				function(){
					$('.onboarding_2').fadeOut().addClass('hidden');
					$('.onboarding_3').removeClass('hidden').fadeIn();
					createRSAKeys(mpw);
				},
				function(){
					alert("Passwords do not match!");
				});
		}
	}
});


$('.onboarding a.btn-mp').click(function(){
	var mpw = $('#inputCreateMPW').val();
	
	browser.storage.local.set({"mpw" : CryptoJS.SHA512(mpw).toString()});
	$('.onboarding').fadeOut().addClass('hidden');
	$('.onboarding_2').removeClass('hidden').fadeIn();
});

$('.onboarding_2 a.btn-mp').click(function(){
	var mpwr = CryptoJS.SHA512($('#inputConfirmMPW').val()).toString();
	var mpw = $('#inputConfirmMPW').val();
	// console.log(mpwr);
	doubleCheckMPW(mpwr,
		function(){
			$('.onboarding_2').fadeOut().addClass('hidden');
			$('.onboarding_3').removeClass('hidden').fadeIn();
			createRSAKeys(mpw);
		},
		function(){
			// $('#inputCreateMPW').addClass("");
			alert("Passwords do not match!");
		});
});


function createRSAKeys(mpw){
	var passphrase = mpw;
	var bits = 1024;

	// create RSA Key pair
	var mRSAkey = cryptico.generateRSAKey(passphrase, bits);
	// create encryption key based on mpw
	var salt = CryptoJS.lib.WordArray.random(128/8);
	var key = CryptoJS.PBKDF2(mpw, salt, {
		keySize: 256/32, 
		iterations: 100
	});
	// extract public key and store it [rsa_public]
	var mPublicKeyString = cryptico.publicKeyString(mRSAkey); 
    browser.storage.local.set({'public_rsa' : mPublicKeyString});  

    // serialize rsa object for encryption
    var RSAKeyString = JSON.stringify(mRSAkey);
	// encrypt rsa object using encryption key and store it [rsa_enc]
	var iv = CryptoJS.lib.WordArray.random(128/8);
	var enc = CryptoJS.AES.encrypt(RSAKeyString,key, {
		iv : iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC
	});

	var encrypted_rsa = salt.toString() + iv.toString() + enc.toString();
	browser.storage.local.set({'rsa_enc' : encrypted_rsa});
	
}

function doubleCheckMPW(a, doNext, showError){
	console.log("Function : doubleCheckMPW");
	// console.log(a);
	var callback = function(res){
		if(a==res.mpw){
			doNext();
			// delete mpw from local storage
			// browser.storage.local.set({"mpw" : {}});
		}else{
			showError();
		}
	}
	getMPW(callback);
}

function getMPW(callback){
	browser.storage.local.get("mpw").then(function(res){callback(res);
	});
}

// show login ui elements
// deprecated
function initLogin(){
	console.log("Function : initLogin");
	$('#inputMPW').get(0).focus();

	var gettingCurrent = browser.windows.getCurrent();
	gettingCurrent.then(function(cRes){
		browser.windows.update(cRes.id,{"height":300});
	});
	$('.login').removeClass("hidden");

}




