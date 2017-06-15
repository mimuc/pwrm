define(['jquery','scripts/tools/crypt', 'scripts/cryptojs/rollups/sha512'] ,function($, crypt, aes){
	return{
		// distinguish between background page and content_script request 
		// background page (managerpage) calls only provide the first argument
		trigger : function(elem, mType, mUrl, mHash, mCategory, mCallback){
			console.log("showPW : trigger");
			var ret; var entry; var unique = false;
			//call origin: background
			if(mType == null && mUrl == null){

				if(elem.attr('type') == 'unique'){
					entry = elem.attr('url');
					unique = true;
				}else{
					entry = elem.attr('cat');
					entry = entry.replace(" ", "_");
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
					// console.log(a.toString());
					// console.log(res.toString());
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
							if(e[key].url == entry){

								crypt.decrypt_aes(e[key].password, passphrase, function(result){
									if(mType == null){
										elem.parent().parent().parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
										$('#modalMPW').modal('hide');
										elem.html('hide');
										
									}else{

										mCallback(result.toString(CryptoJS.enc.Utf8));
									}

								});


								
								
							}
						}

					});
				}else{
					//get category pw
					browser.storage.local.get("categories").then(function(res){
						var e = res.categories
						// console.log("for category: " + entry);
						for(key in e){
							if(key == entry){
								// e[key][2]
								crypt.decrypt_aes(e[key][2], passphrase, function(result){
									// console.log(result);
									if(mType == null){
										elem.parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
										$('#modalMPW').modal('hide');
										elem.html('hide');
										
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