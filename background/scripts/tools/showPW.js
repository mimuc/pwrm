define(['jquery','scripts/tools/crypt', 'scripts/cryptojs/rollups/sha512'] ,function($, crypt, aes){
	return{
		// distinguish between background page and content_script request 
		// background page (managerpage) calls only provide the first argument
		trigger : function(elem, mType, mUrl, mHash, mCategory, mCallback){
			var ret; var entry; var unique = false;
			//call origin: background
			if(mType == null && mUrl == null){

				if(elem.attr('type') == 'unique'){
					entry = elem.attr('url');
					unique = true;
				}else{
					entry = elem.attr('cat');
				}

				$('#modalInputMPW').on('keyup', function() {
					var val = $(this).val();
					if (val.length > 0){
						doubleCheckMPW(
							CryptoJS.SHA512(val),
							function(){getPW(val)});
					}
				});
			// call origin: content script 
			}else{
				console.log("check");
				unique = (mType=='unique');
				entry = (unique) ? mUrl : mCategory;

				doubleCheckMPW(
					CryptoJS.SHA512(mHash),
					function(){getPW(mHash)}
				);
			}
			$('#modalMPW').on('hidden.bs.modal', function (e) {
				// console.log(entry);
			});
			
			function doubleCheckMPW(a, doNext){
				console.log("Function : doubleCheckMPW");
				var callback = function(res){
					console.log(a.toString());
					console.log(res.toString());
					if(a.toString() == res.toString()){
						doNext();
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
					// get unique pw
					console.log("get unique pw");
					browser.storage.local.get("entries").then(function(res){
						var e = res.entries;
						for(key in e){
							//pw entry found
							if(key == entry){
								crypt.decrypt_aes(e[key].password, passphrase, function(result){
									console.log(result);
									if(mType == null){
										elem.parent().parent().parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
										$('#modalMPW').modal('hide');
										elem.html('hide');
										elem.one('click', function(){
											$(this).parent().parent().parent().find('.pwd-hidden').html('*******');
											$(this).html('show');
										});
									}else{

										mCallback(result.toString(CryptoJS.enc.Utf8));
									}

								});


								
								
							}
						}

					});
				}else{
					//get cat pw
					console.log("get cat pw");
					browser.storage.local.get("categories").then(function(res){
						var e = res.categories
								console.log("entry = " + entry);
						for(key in e){
							console.log("key: " + key);
							if(key == entry){
								// e[key][2]
								crypt.decrypt_aes(e[key][2], passphrase, function(result){
									console.log(result);
									if(mType == null){
										elem.parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
										$('#modalMPW').modal('hide');
										elem.html('hide');
										elem.one('click', function(){
											$(this).parent().find('.pwd-hidden').html('*******');
											$(this).html('show');
										});
									}else{
										mCallback(result.toString(CryptoJS.enc.Utf8));
									}
								});

							}
						}
					});
				}
			}
		}
	}
	
});