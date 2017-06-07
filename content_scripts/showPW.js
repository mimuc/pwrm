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
		var val = $(this).val();
		if (val.length > 0){
			doubleCheckMPW(
				CryptoJS.SHA512(val),
				function(){getPW(val)});
		}
	});

	function doubleCheckMPW(a, doNext){
		console.log("Function : doubleCheckMPW");
		var callback = function(res){
			if(a.toString()==res.toString()){doNext();
			}
		}
		getMPW(callback);
	}

	function getMPW(callback){
		browser.storage.local.get("mpw").then(function(res){callback(res.mpw);});
	}

	function getPW(passphrase){
		console.log("Function : getPW");

		if(unique){
			console.log("get unique pw");
					// get unique pw
					browser.storage.local.get("entries").then(function(res){
						var e = res.entries;
						for(key in e){
							//pw entry found
							if(key == entry){
								crypt.decrypt_aes(e[key].password, passphrase, function(result){
									elem.parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
								});
								
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
								crypt.decrypt_aes(e[key][2], passphrase, function(result){
									elem.parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
								});

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


