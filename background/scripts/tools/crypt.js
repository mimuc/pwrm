define(['scripts/cryptojs/rollups/aes','scripts/tools/storagemanagement', 'scripts/cryptojs/rollups/pbkdf2', 'scripts/cryptico/rsa', 'scripts/cryptico/cryptico'],
	function(aes, sl, pbk, rsa){
		console.log("Crypt called");
		return{
			encrypt_rsa:  function(msg, callback){
				if(msg==null){
					callback(null);
				}else{
					sl.getPublicKey(function(publicKey){
						var encryptionResult = cryptico.encrypt(msg, publicKey);
						console.log(encryptionResult.cipher);
						callback(encryptionResult);
					}); 
				}
			},

			decrypt_rsa:  function(encryptedObject, passphrase, callback){
				// recreate rsa key
				var mRSAkey = cryptico.generateRSAKey(passphrase, 1024);
				// decrypt message using RSA Key
				var decryptionResult = cryptico.decrypt(encryptedObject.cipher, mRSAkey);

				callback(decryptionResult.plaintext);
			},
		// security violation?!
		// needs mpw hash to be stored..
		auto_decrypt_rsa:  function(encryptedObject, callback){
			sl.getMPW(function(result){
				// recreate rsa key
				var mRSAkey = cryptico.generateRSAKey(result, 1024);
				// decrypt message using RSA Key
				var decryptionResult = cryptico.decrypt(encryptedObject.cipher, mRSAkey);

				callback(decryptionResult.plaintext);
			});

		}	

	}
});



