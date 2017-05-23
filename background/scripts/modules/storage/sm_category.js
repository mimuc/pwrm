/* manage to display categories retrieved from storage */
define(function() {
	return {
		createCategoryElement: function(categoryName, notes, iconName, pwd){
			var container = document.querySelector('#categoryContainer');
			require(['jquery','scripts/modules/storage/storagemanager'], function($, sm) {
				
				var hasPW = (pwd!=null);
				var icon_lock = (hasPW) ? 'lock':'lock_open';

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

					$(this).find('.lock-icon').html(icon_lock);
					

					$(this).click(function(event) {
						event.stopImmediatePropagation(); //prevents firing twice per click
						$('.panel-card').addClass('low-color');
						$('.panel-card').removeClass('category-focused');
						$('#panel_'+categoryName).removeClass('low-color');

						$('#panel_'+categoryName).addClass('category-focused');
						$('#entryContainer').empty();

						// console.log($(this).attr('haspw'));
						var ic = $(this).find('.lock-icon').text();
						var _hasPW = (ic == 'lock') ? true : false;
						console.log("hasPW: " + _hasPW);
						displayCategoryHeader(catName, _hasPW); //update hasPW before displaying header
						// TODO hier

						sm.loadEntries(categoryName, false);
					});

					$('#cat-icon').attr('id',categoryName+'-icon')
					.html(getIcon(iconName));					
					$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);

				});
			});

			function displayCategoryHeader(name, hasPW){
				var entryContainer = $('#entryContainer');

				if(hasPW){
					entryContainer.append('<h2 class="row-header">'+name+'</h2><div><div id="pwhint_stored"><i class="material-icons hastext">lock</i>Password: ****** <span class="showPW">show</span><a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div></div><hr>');
				}else{
					entryContainer.append('<h2 class="row-header">'+name+'</h2><div><i class="material-icons hastext">lock_open</i> No password stored. <a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div><hr>');
				}
				//configure modal here (event.relatedTarget is created dynamically)
				$('#modalCategory').on('show.bs.modal', function (e) {
					$('#modalYesNo').addClass('hidden');
					$('#modalAction').removeClass('hidden');
					var oldValue = $('#editCategory').attr('oldValue');
					$('#modalCategory #modalCategoryName').val(oldValue);

					var txt = (hasPW) ? 'remove password' : 'add password';
					var msg = (hasPW) ? 'A category password will be stored.' : 'No password will be stored for this category and its entries.';
					var icon = (hasPW) ? 'lock':'lock_open';
					var pw = (hasPW) ? '*******' : '';
					$('#btnAddPWD').html(txt);
					$('#pw-hint span').html(msg);
					$('#pw-hint i').html(icon);
					$('#category-pwd').val(pw);
					if(hasPW){			
						$('#enter-category-pwd').removeClass('hidden');
					}else{
						$('#enter-category-pwd').addClass('hidden');
					}
				});
				$('#modalCategory').on('hidden.bs.modal', function (e) {
					console.log("hide modal");
					$('#modalYesNo').toggleClass('hidden');
					$('#modalAction').toggleClass('hidden');
				});

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
				// console.log(c + " password: " + categories[c]);
				this.createCategoryElement(c,categories[c][0],categories[c][1], categories[c][2]);
			}

			if(loadUniqueEntries){
				require(["scripts/modules/storage/storagemanager"], function(sm){
					sm.loadEntries(null, true);
				});
			}	
		},

		fillDropdown: function(categories) {
			console.log("Function : fillDropdown");
			$('#categoryDropdown').empty();
			for(c in categories){
				var e = document.createElement('option');
				e.textContent = c;
				document.querySelector('#categoryDropdown').append(e);
				
			}
		},
		
		createCategory: function(name, pw){
			var oldName = $('#editCategory').attr('oldValue');

			function guidGenerator() {
				var S4 = function() {
					return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
				};
				return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
			}
			function toggleConfirm(){
				console.log("Function : toggleConfirm");
				$('#modalYesNo').toggleClass('hidden');
				$('#modalAction').toggleClass('hidden');
			}

			var context = this;
			var randID = guidGenerator();
			var cat = ["Info","folder", pw ,randID];
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				var categories = results;
				//check if same name exists (--> override/change name or pw)
				// if(categories.categories != null && categories.categories[name] != null){
				// alert("yo, wait! You want to overwrite this category? change pw or name");
				toggleConfirm();
				console.log(categories);
				$('#modalYes').on('click', function(event){
					 // event.stopImmediatePropagation(); 
					 create(categories, context, oldName, name);
					});
				$('#modalNo').on('click', function(event){
					event.stopImmediatePropagation(); 
					toggleConfirm();});
				
			});

			function reassignEntries(oldName, name, context, categories){
				console.log("Function : reassignEntries");
				var gettingEntries = browser.storage.local.get("entries");
				gettingEntries.then((results) => {
					var entries = results.entries;
					for(key in entries){
						console.log("entries[key].category: " + entries[key].category);
						if(entries[key].category == oldName){
							(entries[key].category = name);
						}
						var newEntries = {"entries" : entries};
						console.log(newEntries);
					}
				//store entries
				var storingEntry = browser.storage.local.set(newEntries);
				storingEntry.then(() => {
					console.log("store success");
					//context.displayNumberEntries();
					context.fillDropdown(categories.categories);

				}, onError);

			});
			}

			function create(categories, context, oldName, name){
				console.log("Function : create");
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
					if(name != oldName){
						deleteCategory(oldName);
						reassignEntries(oldName, name, context, categories);
					}else{
						context.displayCategories(categories.categories, false);
						
					}
				});
			}
		},

		displayNumberEntries: function(){
			console.log("Function : displayNumberEntries");
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