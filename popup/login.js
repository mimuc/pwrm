/* login.js */
$(document).ready(function() {
	//if no masterpw was set in local storage: init onboarding
	var gettingMPW = browser.storage.local.get("mpw");
	gettingMPW.then((results) => {
		var mpwHash = results["mpw"];
	// if(mpwHash == null){
		initOnboarding();
	// }else{
		// initLogin();
	// }
});
});

// show onboarding ui elements
function initOnboarding(){
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
	$('#inputCreateMPW').pwstrength(options);
	$('.progress').addClass("strength");
	$('#inputCreateMPW').focus();
	$('#next .material-icons').on('click', function(){	
		if(++slide == $('.slide').length-1){
			$('.slide').animate({"left": "-=600"}, 500);
			$('#next').fadeOut();
		}else{
			$('.slide').animate({"left": "-=600"}, 500);
		}
	});
	$('#btnOpenManager').on('click', openManager)
	
}

function openManager(){
	var gettingAllWindows = browser.windows.getAll();
	gettingAllWindows.then(function(aRes){
		var gettingCurrent = browser.windows.getCurrent();
		gettingCurrent.then(function(cRes){
			for (var i = 0; i < aRes.length; i++) {
				if(aRes.length == 1){
					console.log("length: 1");
					var removing = browser.windows.remove(cRes.id);
					var creatingWindow = browser.windows.create({
						"url": browser.extension.getURL("background/background.html"),
						"state": "maximized"
					});
				}else{
					if(aRes[i].id != cRes.id && aRes[i].type == "normal"){
					//no other window is opened -> open in new window

					//close self and open in any other opened window as a tab
					var removing = browser.windows.remove(cRes.id);
					var createTab = browser.tabs.create({
						"url": browser.extension.getURL("background/background.html"),
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
//first time mpw was entered -> encrypt and doublecheck hashes
$('.onboarding a.btn-mp').click(function(){
	var mpw = $('#inputCreateMPW').val();
	console.log(mpw);
	//store mpw

	browser.storage.local.set({"mpw" : mpw});
	$('.onboarding').fadeOut().addClass('hidden');
	$('.onboarding_2').removeClass('hidden').fadeIn();
	$('inputConfirmMPW').focus();
});

$('.onboarding_2 a.btn-mp').click(function(){
	var mpwr = $('#inputConfirmMPW').val();
	console.log("das zweite " + mpwr);
	
	doubleCheckMPW($('#inputConfirmMPW').val(),
		function(){
			$('.onboarding_2').fadeOut().addClass('hidden');
			$('.onboarding_3').removeClass('hidden').fadeIn();
		},
		function(){
			alert("hoidaus");
		});
});

function doubleCheckMPW(a, doNext, showError){
	var callback = function(res){
		if(a==res.mpw){doNext();
		}else{showError();}
	}
	getMPW(callback);
}

function getMPW(callback){
	browser.storage.local.get("mpw").then(function(res){callback(res);});
}

// show login ui elements
function initLogin(){
	console.log("Function : initLogin");
	$('.login').removeClass("hidden");
	$('inputMPW').focus();
}

$('#btnUnlock').on('click', function(){
	doubleCheckMPW(
		$('#inputMPW').val(),
		function(){console.log("basd");},
		function(){alert("hoidaus");}
		);
});


