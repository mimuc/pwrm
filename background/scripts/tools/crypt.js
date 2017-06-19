define(['scripts/cryptojs/rollups/aes','scripts/tools/storagemanagement'],function(aes, sl){
	console.log("Crypt called");
	return{
		encrypt_aes:  function(msg, callback){
			sl.getMPWHash(function(result){
				var enc = CryptoJS.AES.encrypt(msg,result.mpw.toString()).toString();
				// console.log("save with pp: "+ result.mpw);
				callback(enc);
			});
		},

		decrypt_aes:  function(enc, passphrase, callback){
			console.log("crypt- pw_enc: "+ enc);
			sl.getMPWHash(function(result){
				var mpwHash = result.mpw;
				var h_passphrase = CryptoJS.SHA512(passphrase).toString();
				// check passphrase against MPWHash in storage
				if (mpwHash == h_passphrase){
					var decrypted = CryptoJS.AES.decrypt(enc, h_passphrase); 
				}
				callback(decrypted);
		});

		},
		auto_decrypt_aes:  function(enc, callback){
			sl.getMPWHash(function(result){
				var mpwHash = result.mpw;
				var decrypted = CryptoJS.AES.decrypt(enc, mpwHash); 
				callback(decrypted.toString(CryptoJS.enc.Utf8));
		});

		}	

	}
});



