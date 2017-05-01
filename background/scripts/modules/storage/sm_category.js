/* manage to display categories retrieved from storage */
define(function() {

	return {
		createCategoryElement: function(categoryName){
			var container = document.querySelector('#categoryContainer');
			var returnNode;
			require(['jquery','scripts/modules/storage/storagemanager'], function($, sm) {
				//load snippet
				$('#categoryContainer').append('<div id="wrapper_'+categoryName+'"></div>');
				$('#wrapper_'+categoryName).load('scripts/modules/ui/collapse_snippet.html',null,
					function() {
					//alter DOM (id, classnames)
					$('#_heading_').attr('id', 'heading_'+categoryName);

					$('#_listGroup_').attr('id', 'listGroup_'+categoryName);					
					
					$('#_title_').attr('href', '#listGroup_'+categoryName)
					.attr('id', '#title_'+categoryName)
					.attr('aria-controls', 'listGroup_'+categoryName)
					.html(categoryName);
					
					
					$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);
					sm.loadEntries();
				});
			});
	

		},

		displayCategories: function(categories) {
			console.log("Function : displayCategories");
			for(c in categories){
				console.log(c);
				this.createCategoryElement(c);
			}
		}
	}
});