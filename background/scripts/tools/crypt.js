define(['scripts/cryptojs/rollups/aes','scripts/tools/storagemanagement', 'scripts/cryptojs/rollups/pbkdf2'],
	function(aes, sl, pbk){
	console.log("Crypt called");
	return{
		encrypt_aes:  function(msg, callback){
			sl.getMPWHash(function(result){
				var salt = CryptoJS.lib.WordArray.random(128/8);
				// console.log(salt);
				var key = CryptoJS.PBKDF2(result.mpw.toString(), salt, {
					keySize: 256/32, 
					iterations: 100
				});
				console.log("encrypt key: " + key);
				// console.log(result.mpw.toString());
				// console.log(key);

				var iv = CryptoJS.lib.WordArray.random(128/8);
				var enc = CryptoJS.AES.encrypt(msg,key, {
					iv : iv,
					padding: CryptoJS.pad.Pkcs7,
					mode: CryptoJS.mode.CBC
				});

				//  TODO don't separate strings obviously!
				// var message = salt.toString() + ";;" + iv.toString() + ";;" + enc.toString();
				var message = salt.toString() + iv.toString() + enc.toString();
				console.log("iv size: " + iv.toString().length);
				callback(message);
			}); 
		},

		decrypt_aes:  function(message, passphrase, callback){
		
				var salt = CryptoJS.enc.Hex.parse(message.substr(0,32));
				var iv = CryptoJS.enc.Hex.parse(message.substr(32,32));
				var encrypted = message.substring(64);
				// var salt = CryptoJS.enc.Hex.parse(message.split(";;")[0]);
				// var iv = CryptoJS.enc.Hex.parse(message.split(";;")[1]);
				// var encrypted = message.split(";;")[2];
				console.log(message);
				console.log(encrypted);

				var h_passphrase = CryptoJS.SHA512(passphrase).toString();
				
				var key = CryptoJS.PBKDF2(h_passphrase, salt, {
					keySize: 256/32,
					iterations: 100
				});
				console.log("decrypt key: " + key);
				// check passphrase against MPWHash in storage
				// TODO don't check!
				// if (mpwHash == h_passphrase){
				var decrypted = CryptoJS.AES.decrypt(encrypted, key,{
					iv: iv,
					padding: CryptoJS.pad.Pkcs7,
					mode: CryptoJS.mode.CBC
				}); 
				console.log(decrypted.toString(CryptoJS.enc.Utf8));
				// }
				callback(decrypted.toString(CryptoJS.enc.Utf8));
	

		},
		// security violation?!
		// needs mpw hash to be stored..
		auto_decrypt_aes:  function(message, callback){
			sl.getMPWHash(function(result){
				var salt = CryptoJS.enc.Hex.parse(message.split(";;")[0]);
				var iv = CryptoJS.enc.Hex.parse(message.split(";;")[1]);
				var encrypted = message.split(";;")[2];
				console.log(message);
				console.log(encrypted);

				
				
				var key = CryptoJS.PBKDF2(result.mpw, salt, {
					keySize: 256/32,
					iterations: 100
				});
				console.log("decrypt key: " + key);
				// check passphrase against MPWHash in storage
				// TODO don't check!
				// if (mpwHash == h_passphrase){
				var decrypted = CryptoJS.AES.decrypt(encrypted, key,{
					iv: iv,
					padding: CryptoJS.pad.Pkcs7,
					mode: CryptoJS.mode.CBC
				}); 
				console.log(decrypted.toString(CryptoJS.enc.Utf8));
				// }
	
				callback(decrypted.toString(CryptoJS.enc.Utf8));
		});

		}	

	}
});



