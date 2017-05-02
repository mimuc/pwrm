/* manage to display categories retrieved from storage */
define(function() {

	return {
		createCategoryElement: function(categoryName, notes, iconName){
			var container = document.querySelector('#categoryContainer');

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
					.html('<strong>'+categoryName+'</strong>');
					
					$('#cat-subtitle').attr('id', categoryName+'-subtitle')
					.html(notes);

					$('#cat-icon').attr('id',categoryName+'-icon')
					.html(getIcon(iconName));					

					$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);
				});
			});

			function getIcon(name){
				console.log("Function : getIcon");
				var iconString = "folder";
				switch(name){
					case "euro_symbol":
					iconString = "euro_symbol";
					break;

					case "email":
					iconString = "email";
					break;
				}

				return iconString
			}

		},

		displayCategories: function(categories) {
			console.log("Function : displayCategories");
			for(c in categories){				
				this.createCategoryElement(c,categories[c][0],categories[c][1]);
			}
			//dirty call (loadEntries should be called after all categories are created [async])
			//works fine for now
			require(['scripts/modules/storage/storagemanager'], function(sm) {
				sm.loadEntries();
			});
		},

		fillDropdown: function(categories) {
			console.log("Function : fillDropdown");

			for(c in categories){
				var e = document.createElement('option');
				e.textContent = c;
				document.querySelector('#categoryDropdown').append(e);
				
			}


		}

		
	}
});