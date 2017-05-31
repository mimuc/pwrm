function show(elem){
	$('#pwhint_stored').hide();
	$('#inputMPW').show();
	setupInputMPW(elem);
}

function setupInputMPW(elem){
	console.log("showpw.js injected");

	console.log("trigger");
	var ret;
	var entry; var unique = false;
	
	if(elem.attr('type') == 'unique'){
		entry = elem.attr('url');
		unique = true;
	}else{
		entry = elem.attr('cat');
	}

	$('#inputMPW').on('keyup', function() {
		console.log($(this).val());

		if ($(this).val().length > 0){
			doubleCheckMPW($(this).val(),
				function(){
					getPW();
				});
		}
	});

	function doubleCheckMPW(a, doNext){
	var callback = function(res){
		if(a==res.mpw){doNext();
		}
	}
	getMPW(callback);
}

function getMPW(callback){
	browser.storage.local.get("mpw").then(function(res){callback(res);});
}

function getPW(){
	console.log("Function : getPW");

	if(unique){
					// get unique pw
					browser.storage.local.get("entries").then(function(res){
						var e = res.entries;
						for(key in e){
							//pw entry found
							if(key == entry){
								console.log(e[key].password);
								elem.parent().find('.pwd-hidden').html(e[key].password);
								$('#inputMPW').val('');
								$('#inputMPW').hide();
								$('#pwhint_stored').show();
								elem.html('hide');
								elem.one('click', function(){
									$(this).parent().find('.pwd-hidden').html('*******');
									$(this).html('show');
								});
							}
						}
					});
				}else{
					console.log("getting cat pw");
					//get cat pw
					browser.storage.local.get("categories").then(function(res){
						var e = res.categories
						for(key in e){

							if(key == entry){
								console.log(e[key][2]);
								elem.parent().find('.pwd-hidden').html(e[key][2]);
								$('#inputMPW').val('');
								$('#inputMPW').hide();
								$('#pwhint_stored').show();
								elem.html('hide');
								elem.one('click', function(){
									$(this).parent().find('.pwd-hidden').html('*******');
									$(this).html('show');
								});
							}
						}
					});
				}
			}


}


