/* manage to display categories retrieved from storage */
define(function() {
	return {
		createCategoryElement: function(categoryName, notes, iconName, pwd){
			var container = document.querySelector('#categoryContainer');
			require(['jquery','scripts/modules/storage/storagemanager'], function($, sm) {


				//load snippet
				$('#categoryContainer').append('<div id="wrapper_'+categoryName+'"></div>');
				$('#wrapper_'+categoryName).load('scripts/modules/ui/category_snippet.html',null,
				//$('#wrapper_'+categoryName).load('scripts/modules/ui/collapse_snippet.html',null,
				function() {
					//alter DOM (id, classnames)
					var catName = categoryName.replace('_', ' ');

					$(this).children(":first").attr('id','categorywrapper_'+categoryName);
					$('#_heading_').attr('id', 'panel_'+categoryName);
					$('#_numberAccounts_').attr('id', 'numberAccounts_'+categoryName);			
					
					$('#_title_').attr('href', '#listGroup_'+categoryName)
					.attr('id', '#title_'+categoryName)
					.attr('aria-controls', 'listGroup_'+categoryName)
					.html('<div class="cat-title">'+catName+'</div>');
					
					$(this).click(function(event) {
						event.stopImmediatePropagation(); //prevents firing twice per click
						$('.panel-card').addClass('low-color');
						$('.panel-card').removeClass('category-focused');
						$('#panel_'+categoryName).removeClass('low-color');

						$('#panel_'+categoryName).addClass('category-focused');
						$('#entryContainer').empty();

						displayCategoryHeader(catName, pwd);
						console.log("call loadEntries");
						sm.loadEntries(categoryName, false);
					});
					
					$('#cat-icon').attr('id',categoryName+'-icon')
					.html(getIcon(iconName));					
					$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);


				});
			});
			function displayCategoryHeader(name, pwd){
				var entryContainer = $('#entryContainer');
				if(pwd!=null){
					entryContainer.append('<h2 class="row-header">'+name+'</h2><div><div id="pwhint_stored"><i class="material-icons hastext">lock</i>Password: ****** <span class="showPW">show</span><a href="#"><i class="material-icons hastext">edit</i></div></div><hr>');
				}else{
					entryContainer.append('<h2 class="row-header">'+name+'</h2><div><i class="material-icons hastext">lock_open</i> No password stored. <a id="editCategory" class="link" oldValue="'+ name +'">Edit category</a></div><hr>');
					
					//configure module here (event.relatedTarget is created dynamically)
					$('#editCategory').on('click', function(event){
						$('#modalCategory').on('show.bs.modal', function (e) {
							var oldValue = $('#editCategory').attr('oldValue');
							$('#modalCategory #modalCategoryName').val(oldValue);
						}).modal('show');
					});
					

				}
			}



			function getIcon(name){
				console.log("Function : getIcon");
				/*
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
				*/
				return name;
			}
			this.displayNumberEntries();
		},

		displayCategories: function(categories, loadUniqueEntries) {
			console.log("Function : displayCategories");
			for(c in categories){				
				this.createCategoryElement(c,categories[c][0],categories[c][1]);
			}
			//dirty call (loadEntries should be called after all categories are created [async])
			//works fine for now
			
			if(loadUniqueEntries){
				require(["scripts/modules/storage/storagemanager"], function(sm){
					sm.loadEntries(null, true);
				});
			}
			
		},
		fillDropdown: function(categories) {
			console.log("Function : fillDropdown");
			for(c in categories){
				var e = document.createElement('option');
				e.textContent = c;
				document.querySelector('#categoryDropdown').append(e);
				
			}
		},
		
		

		createCategory: function(name){

			function guidGenerator() {
				var S4 = function() {
					return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
				};
				return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
			}

			var randID = guidGenerator();
			var cat = ["Info","folder", randID];
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				var categories = results;
				//push new entry
				categories.categories[name] = cat;
				//store changes
				var storingCategory = browser.storage.local.set(categories);
				storingCategory.then(()=> {
					
					//empty entry container
					var entryContainer = document.getElementById("entryContainer");
					while (entryContainer.firstChild) {
						entryContainer.removeChild(entryContainer.firstChild);
					}
					this.fillDropdown(categories.categories);
					this.displayCategories(categories.categories, false);
				});
			});


		},

		displayNumberEntries: function(){
			console.log("Function : getNumberEntries");
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((catResults) => {
				var categories = catResults["categories"];
				
				var gettingEntries = browser.storage.local.get("entries");
				gettingEntries.then((eResults) => {
					var entries = eResults["entries"];
					for(cKey in categories){
						var number = 0;
						for(key in entries){
							if(entries[key].category == cKey) number++;
						}
						document.querySelector('#numberAccounts_'+cKey).innerHTML = "Number Accounts: " + number;
					}
				});
			});
			
		},

		deleteCategory: function(category){
			//ask if sure
			//if category is not empty --> move entries to unsorted
			console.log("Function : deleteCategory");
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				var oldCategories = results.categories;					
				delete oldCategories[category];	

					//save the altered version of the entry-element in storage
					var storingCategories = browser.storage.local.set({"categories" : oldCategories});
					storingCategories.then(() => {
						//remove element from DOM 
						document.getElementById("wrapper_"+category).remove();
						this.displayCategories(oldCategories, true);
					}, onError);	

				});

		},

		changeCategoryIcon: function(catName, iconName){
			console.log("Function : changeCategoryIcon");
			var gettingEntries = browser.storage.local.get("categories");
			gettingEntries.then((results) => {
				var id;
				var cat = results.categories;					
				for(key in cat){
					if(key == catName){
						(cat[key][1] = iconName);
					}
				}

				var newCat = {"categories" : cat};
				console.log(newCat);

				//store entries
				var storingEntry = browser.storage.local.set(newCat);
				storingEntry.then(() => {
					console.log("store success");
					//display new entry			
					//remove from DOM
					this.displayCategories(newCat.categories, true);



				//console.log()
			}, onError);
				

			});
		},


		//move entry with identifier "url" to a new Category newCategory
		moveToCategory: function(url, newCategory){
			console.log("Function : moveToCategory");
			var gettingEntries = browser.storage.local.get("entries");
			gettingEntries.then((results) => {
				var id;
				var entries = results.entries;					
				for(key in entries){
					if(key == url){
						(entries[key].category = newCategory);
						id = entries[key].id;
					}
				}

				var newEntries = {"entries" : entries};
				console.log(newEntries);

				//store entries
				var storingEntry = browser.storage.local.set(newEntries);
				storingEntry.then(() => {
					console.log("store success");
					//display new entry			
					//remove from DOM
					document.getElementById("entryWrapper_"+id).remove();
					require(["scripts/modules/storage/storagemanager"], function(sm){
						sm.loadEntries();
					});
					this.displayNumberEntries();


				//console.log()
			}, onError);
				

			});
		}

		
	}
});