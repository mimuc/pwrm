/* display entries */
define(['scripts/tools/showPW','scripts/tools/crypt', 'psl','jquery'],function(showPW, crypt,psl,$) {
	return {
		displayEntry: function(url, credential, hasCategory) {
			var entryContainer, content;

			var turl = url.split("/")[2]; // Get the hostname
			var parsed = psl.parse(turl); // Parse the domain
			var urlName = parsed.domain;

			if(credential.category != null){
				entryContainer = document.querySelector('#entryContainer');
				content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-6">01.01.17</div><div class="entry-actions"><div class="col-lg-2"></div><div class="col-lg-2"><a><i id="'+ url +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.id+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}else{
				entryContainer = document.querySelector('#uniqueEntryContainer');
				entryContainer.style.display = '';
				content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-3">01.01.17</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2"><span type="unique" url="'+url+'" class="showPW">show</span></div><div class="col-lg-2"><a><i id="'+ url +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.id+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}

			var entryWrapper = document.createElement('div');
			entryWrapper.setAttribute('id', 'entryWrapper_'+credential.id);
			entryWrapper.setAttribute('class', 'entry-row row');
			entryContainer.appendChild(entryWrapper);

			var ew = $('#entryWrapper_'+credential.id);
			ew.fadeIn();
			// ew.animate({marginTop:"-=100px"},300);


			$('#entryWrapper_'+credential.id).hover(function() {
				/* Stuff to do when the mouse enters the element */
				$('#entryWrapper_'+credential.id+' .entry-actions').show();
			}, function() {
				$('#entryWrapper_'+credential.id+' .entry-actions').hide();
			});
			
			var requestURL = "https://icons.better-idea.org/allicons.json?url="+urlName;
			var wrapper = $('#entryWrapper_'+credential.id);

			var HttpClient = function() {
				this.get = function(mpURL, mpCallback) {
					var mpHttpRequest = new XMLHttpRequest();
					mpHttpRequest.onreadystatechange = function() { 
						if(mpHttpRequest.status === 404){
							mpCallback(null);
						}else if (mpHttpRequest.readyState == 4 && mpHttpRequest.status == 200)
						mpCallback(mpHttpRequest.responseText);
					}
					mpHttpRequest.open( "GET", mpURL, true );            
					mpHttpRequest.send( null );
				}
			}

			wrapper.append(content);

			$('.showPW').on('click', function(){
				showPW.trigger($(this));
				if($(this).html() == 'show'){
					$('#modalMPW').on('shown.bs.modal', function (e) {
						$('#modalInputMPW').val('');
						$('#modalInputMPW').focus();
					});
					$('#modalMPW').modal('show');
				}
			});
    		//wrapper.append('<div class="row entry"><div class="col-lg-12"><h4>'+url+'</h4><hr><div class="row"><div class="col-lg-8"><p>'+credential.username+'</p></div><div class="col-lg-2 entry-icons"><i id="'+url+'" class="material-icons">delete</i></div><div class="col-lg-2 entry-icons"><i id="open_'+credential.id+'" class="material-icons">open_in_new</i></div></div>');
    		var deleteBtn = document.getElementById(url);
    		var openBtn = document.getElementById("open_"+credential.id);

    		openBtn.addEventListener('click', function(e){
    			var creating = browser.tabs.create({
    				url: url
    			});
    		});
			//id (== url) is saved in button
			
			deleteBtn.addEventListener('click',function(e){
				evtTgt = e.target;
				//TODO adapt to new storage design
				deleteThisEntry(evtTgt.getAttribute('id'));
				//remove from DOM
				document.querySelector('#entryWrapper_'+credential.id).remove();	
			});


			var client = new HttpClient();
			client.get(requestURL, function(response) {
    			// console.log(JSON.parse(response).icons[0].url);
    			
    			favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
    			var res = JSON.parse(response);
    			if(res != null && res.icons != null && res.icons[0] != null){
    				//console.log(response);
    				favIcon = JSON.parse(response).icons[0].url;
    			}else{
    				console.log("fallback to placeholder");
    				//TODO create initial-placeholder
    				favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
    			}

    			$('#entryWrapper_'+credential.id+' .placeholder-img').attr('src', favIcon);
    			
    		});


			function deleteThisEntry(url){
				console.log("Function : deleteThisEntry");
				var gettingEntries = browser.storage.local.get("entries");
				gettingEntries.then((results) => {
					var oldEntries = results.entries;					
					delete oldEntries[url];	
					
					//save the altered version of the entry-element in storage
					var storingEntry = browser.storage.local.set({"entries" : oldEntries});
					storingEntry.then(() => {
						console.log("element " + url + " deleted. Entries updated.");
						MVC_View_Managerpage.displayNumberEntries();
					}, onError);	

				});
			}
		},
		createCategoryElement: function(categoryName, notes, iconName, pwd){
			var _this = this;
			
			var container = document.querySelector('#categoryContainer');
			require(['jquery','MVC_Model'], function($, sm) {
				
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
						var entryContainer = $('#entryContainer');
						var panelCard = $('.panel-card');
						event.stopImmediatePropagation(); //prevents firing twice per click
						if(!$('#panel_'+categoryName).hasClass('category-focused')){
							panelCard.addClass('low-color');
							panelCard.removeClass('category-focused');
							$('#panel_'+categoryName).removeClass('low-color');

							$('#panel_'+categoryName).toggleClass('category-focused');
							entryContainer.empty();
							// console.log($(this).attr('haspw'));
							var ic = $(this).find('.lock-icon').text();
							var _hasPW = (ic == 'lock') ? true : false;
							// console.log("hasPW: " + _hasPW);
							_this.displayCategoryHeader(catName, _hasPW); //update hasPW before displaying header
							sm.loadEntries(categoryName, false);
						}else{
							console.log("deselected");
							$('#panel_'+categoryName).toggleClass('category-focused');
							panelCard.addClass('low-color');
							var entryContainer = $('#entryContainer');
							var cardWrapper = entryContainer.parent();
							
							entryContainer.fadeOut(300);

							entryContainer.empty();
							entryContainer.hide();
						}					
					});

					$('#cat-icon').attr('id',categoryName+'-icon')
					.html(getIcon(iconName));					
					$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);

				});
			});

			_this.displayNumberEntries();

			

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
			
		},
		displayCategoryHeader : function(name, hasPW){
			var entryContainer = $('#entryContainer');
			var cardWrapper = entryContainer.parent();
		
			cardWrapper.fadeIn(300);
			entryContainer.fadeIn(400);
			

			if(hasPW){
				entryContainer.append('<h2 class="row-header">'+name+'</h2><div><div id="pwhint_stored"><i class="material-icons hastext">lock</i><span class="pwd-hidden">*******</span><span type="cat" cat="'+name+'" class="showPW">show</span><a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div></div><hr>');
			}else{
				entryContainer.append('<h2 class="row-header">'+name+'</h2><div><i class="material-icons hastext">lock_open</i> No password stored. <a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div><hr>');
			}
				//configure modal here (event.relatedTarget is created dynamically)
				this.setupModalCategory(hasPW);
				this.setupShowButton();
			},

			setupModalCategory : function(hasPW){
				$('#modalCategory').on('hidden.bs.modal', function (e) {
					console.log("hide modal");
					$('#modalYesNo').toggleClass('hidden');
					$('#modalAction').toggleClass('hidden');
				});
				$('#modalCategory').on('show.bs.modal', function (e) {

					$('#modalYesNo').addClass('hidden');
					$('#modalAction').removeClass('hidden');
					var oldValue = $('#editCategory').attr('oldValue');

					if($(e.relatedTarget).hasClass('button-sub')){
						console.log("relatedTarget has button-sub");
						$('#modalCategory #modalCategoryName').val('');
						$('#modalCategory').addClass('new');
						$('#editCategory').attr('oldValue', '');
						//do nothing --> completely new category when triggered from FAB button
					}else{
						$('#modalCategory').removeClass('new');
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
					}
				});
			},

			setupShowButton : function(){
				$('.showPW').on('click', function(e){
					// e.stopImmediatePropagation();
					showPW.trigger($(this));
					if($(this).html() == 'show'){
						$('#modalMPW').on('shown.bs.modal', function (e) {
							$('#modalInputMPW').val('');
							$('#modalInputMPW').focus();
						});
						$('#modalMPW').modal('show');
					}
				});
			},

			displayCategories: function(categories, loadUniqueEntries) {
				console.log("Function : displayCategories");
				this.setupModalCategory(false);
				this.setupShowButton();
				for(c in categories){				
				// console.log(c + " password: " + categories[c]);
				this.createCategoryElement(c,categories[c][0],categories[c][1], categories[c][2]);
			}

			if(loadUniqueEntries){
				require(["MVC_Model"], function(sm){
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
		
		createCategory: function(name, pw, isNew){
			var context = this;
			console.log("Function : createCategory");
			crypt.encrypt_aes(pw, function(data){
			var pw_enc = data;
			
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

			
			var randID = guidGenerator();
			var cat = ["Info","folder", pw_enc ,randID];
			var gettingCategories = browser.storage.local.get("categories");
			gettingCategories.then((results) => {
				var categories = results;
				//check if same name exists (--> override/change name or pw)
				// if(categories.categories != null && categories.categories[name] != null){
				// alert("yo, wait! You want to overwrite this category? change pw or name");
				toggleConfirm();
				$('#modalYes').off('click');
				$('#modalYes').on('click', function(event){
					 event.stopImmediatePropagation(); 
					 create(categories, context, oldName, name, isNew);
					 var icon = (pw==null) ? 'lock_open' : 'lock';
					 $('#panel_'+name+' .lock-icon').html(icon);
					});
				$('#modalNo').off('click');
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
				if(newEntries != null){
					var storingEntry = browser.storage.local.set(newEntries);
					storingEntry.then(() => {
						console.log("store success");
					//context.displayNumberEntries();
					context.fillDropdown(categories.categories);

				}, onError);
				}else{
					context.fillDropdown(categories.categories);
				}

			});
			}

			function create(categories, context, oldName, name, isNew){
				console.log("Function : create -isNew: " + isNew + ' oldName: ' + oldName);
			//push new entry 
			var mCat = categories;
			mCat.categories[name] = cat;
				//store changes
				var storingCategory = browser.storage.local.set(mCat);
				storingCategory.then(()=> {
					//empty entry container
					if(!isNew){
						var entryContainer = document.getElementById("entryContainer");
						while (entryContainer.firstChild) {
							entryContainer.removeChild(entryContainer.firstChild);
						}
						if(oldName!=null){
							if(name != oldName){
								console.log("name != oldName");
								deleteCategory(oldName);
								reassignEntries(oldName, name, context, mCat);
							}
						}
					}else{
						console.log("no update. was new category");
						context.displayCategories(mCat.categories, false);
					}
				});
			}
			});
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
						if($('#numberAccounts_'+cKey) != null){
							$('#numberAccounts_'+cKey).html("Number Accounts: " + number);
						}
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
					require(["MVC_Model"], function(sm){
						sm.loadEntries();
					});
					this.displayNumberEntries();


				//console.log()
			}, onError);
				

			});
		}
		
	}
});
