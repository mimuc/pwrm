define(['jquery','scripts/tools/crypt'] ,function($, crypt){
	return{
		// distinguish between background page and content_script request
		// TODO
		trigger : function(elem, mType, mUrl, mHash, mCallback){
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
							CryptoJS.MD5(val),
							function(){getPW(val)});
					}
				});

			}else{
				// call origin: content script 
				unique = true;
				entry = mUrl;

				doubleCheckMPW(
					CryptoJS.MD5(mHash),
					function(){getPW(mHash)}
				);
			}
			$('#modalMPW').on('hidden.bs.modal', function (e) {
				// console.log(entry);
			});
			
			function doubleCheckMPW(a, doNext){
				var callback = function(res){
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
						for(key in e){
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