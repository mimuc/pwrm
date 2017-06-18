// Logger
define(['jquery'], function($){
	var exports = {};

	var log = exports.log = function(value){
		browser.storage.local.get('webexID').then(function(result){
		var file = "Log_"+result["webexID"];

		$.post("http://fuasmattn.de/pwm_logserver/logger.php",
		{
			filename: file,
			log: value
		},
		function(data, status){
			// alert("Data: " + data + "\nStatus: " + status);
		});
			
		});
	};
	

	return exports;

});