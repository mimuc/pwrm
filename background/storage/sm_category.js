/* manage to display categories retrieved from storage */
define(function(sm_category) {

	return {
		createCategoryElement: function(categoryName){
			//create cards/any container with id as identifier
			var wrapper = document.createElement('div');
			var header = document.createElement('div');
			var content = document.createElement('div');

			wrapper.setAttribute('class', 'categoryWrapper');
			content.setAttribute('class', 'categoryContent');
			header.textContent = categoryName;
			wrapper.appendChild(header);			

			var container = document.querySelector('#categoryContainer');
			console.log(container);
			container.appendChild(wrapper);

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