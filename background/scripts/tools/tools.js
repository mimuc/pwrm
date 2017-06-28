	
define(function() {
	var exports = {};
	
	var guidGenerator = exports.guidGenerator = function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	var getDate = exports.getDate = function(){
		return new Date(Date.now()).toLocaleDateString({ year: 'numeric', month : 'numeric', day : 'numeric' });
	};


	return exports;
	});


