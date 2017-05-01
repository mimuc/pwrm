// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
/*
requirejs.config({
	baseUrl: 'scripts',
	paths: {
		storagemanager: '/modules/storage',
		sm_display: '/modules/storage',
		sm_category: '/modules/storage',
		entry: '/modules/storage',
		jquery: '/jquery',
		bootstrap: '/bootstrap'

	}
});

*/
requirejs.config({
	baseUrl: '',
	paths: {
		"jquery" : "scripts/jquery/jquery"
	}
});
/*
define(function(require) {
	
	var storagemanager = require('storagemanager'),
		sm_display = require('sm_display'),
		sm_category = require('sm_category'),
		entry = require('entry'),
		bootstrap = require('bootstrap');

		return function () {};

});
*/
// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['background.js']);