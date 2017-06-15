define(['scripts/tools/showPW','scripts/tools/crypt','jquery', 'scripts/tools/storagemanagement', 'MVC_Controller_Managerpage', 'psl'],
	function(showPW, crypt, $, SL, controller, psl) {
		var exports = {};

	var displayEntry = exports.displayEntry = function(randID, urlName, credential, hasCategory) {
		console.log("View : displayEntry");
		var entryContainer, content;
		if(credential.category != null){
			entryContainer = document.querySelector('#entryContainer');
			content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ credential.url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-6">01.01.17</div><div class="entry-actions"><div class="col-lg-2"></div><div class="col-lg-2"><a><i id="'+ randID +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}else{
			entryContainer = document.querySelector('#uniqueEntryContainer');
			entryContainer.style.display = '';
			content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ credential.url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-3">01.01.17</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2"><a><i id="'+ randID +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}

		var entryWrapper = document.createElement('div');
		entryWrapper.setAttribute('id', 'entryWrapper_'+randID);
		entryWrapper.setAttribute('class', 'entry-row row');
		entryContainer.appendChild(entryWrapper);

		var ew = $('#entryWrapper_'+randID);
		ew.fadeIn();
		// ew.animate({marginTop:"-=100px"},300);

		$('#entryWrapper_'+randID).hover(function() {
			/* Stuff to do when the mouse enters the element */
			$('#entryWrapper_'+randID+' .entry-actions').show();
		}, function() {
			$('#entryWrapper_'+randID+' .entry-actions').hide();
		});
		
		var requestURL = "https://icons.better-idea.org/allicons.json?url="+credential.url;
		var wrapper = $('#entryWrapper_'+randID);

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
		var deleteBtn = document.getElementById(randID);
		var openBtn = document.getElementById("open_"+credential.url);

		openBtn.addEventListener('click', function(e){
			var creating = browser.tabs.create({
				url: credential.url
			});
		});
		//id (== url) is saved in button
		
		deleteBtn.addEventListener('click',function(e){
			evtTgt = e.target;
			//TODO adapt to new storage design
			deleteThisEntry(evtTgt.getAttribute('id'));
			//remove from DOM
			document.querySelector('#entryWrapper_'+randID).remove();	
		});


		// var client = new HttpClient();
		httpGet(requestURL, function(response) {
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

			$('#entryWrapper_'+randID+' .placeholder-img').attr('src', favIcon);
			
		});	
	};
	var displaySearchEntry = exports.displaySearchEntry = function(randID, urlName, credential) {
		// console.log("View : displayEntry (search)");
		var entryContainer, content;
		var resultContainer = $('#searchEntryContainer');
		if(credential.category != null){
			entryContainer = document.querySelector('#searchResults-category');
			content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ credential.url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-6">01.01.17</div><div class="entry-actions"><div class="col-lg-2"></div><div class="col-lg-2"><a><i id="'+ randID +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}else{
			entryContainer = document.querySelector('#searchResults-unique');
			entryContainer.style.display = '';
			content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ credential.url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-3">01.01.17</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}

		var entryWrapper = document.createElement('div');
		entryWrapper.setAttribute('id', 'entryWrapper_'+randID);
		entryWrapper.setAttribute('class', 'entry-row row');
		entryContainer.appendChild(entryWrapper);

		var ew = $('#entryWrapper_'+randID);
		ew.fadeIn();
		// ew.animate({marginTop:"-=100px"},300);

		$('#entryWrapper_'+randID).hover(function() {
			/* Stuff to do when the mouse enters the element */
			$('#entryWrapper_'+randID+' .entry-actions').show();
		}, function() {
			$('#entryWrapper_'+randID+' .entry-actions').hide();
		});
		
		var requestURL = "https://icons.better-idea.org/allicons.json?url="+credential.url;
		var wrapper = $('#entryWrapper_'+randID);

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
		var deleteBtn = document.getElementById(randID);
		var openBtn = document.getElementById("open_"+credential.url);

		openBtn.addEventListener('click', function(e){
			var creating = browser.tabs.create({
				url: credential.url
			});
		});
		//id (== url) is saved in button
		
		deleteBtn.addEventListener('click',function(e){
			evtTgt = e.target;
			//TODO adapt to new storage design
			deleteThisEntry(evtTgt.getAttribute('id'));
			//remove from DOM
			document.querySelector('#entryWrapper_'+randID).remove();	
		});


		// var client = new HttpClient();
		httpGet(requestURL, function(response) {
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

			$('#entryWrapper_'+randID+' .placeholder-img').attr('src', favIcon);
			
		});
	};
	var displaySearchResults = exports.displaySearchResults = function(results){
		$('#searchEntryContainer *').empty();
		$('#searchResults-category').append('<h2 class="search-result-header"><i class="material-icons">book</i> categories</h2>');
		$('#searchResults-unique').append('<h2 class="search-result-header"><i class="material-icons">list</i> unique</h2>');
		if(results!=0){
			for(key in results){
				var mUrl = results[key].url;
		      	var turl = mUrl.split("/")[2]; // Get the hostname
		      	var parsed = psl.parse(turl); // Parse the domain
		      	var urlName = parsed.domain;
		      	urlName = urlName.split(".")[0];
		      	displaySearchEntry(key, urlName, results[key]);
	      }
	  }
	};
	var createCategoryElement = exports.createCategoryElement = function(categoryName, notes, iconName, pwd){

		var container = document.querySelector('#categoryContainer');
		require(['jquery', 'MVC_Controller_Managerpage'], function($, controller) {

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
					// testing
					// end testing

					panelCard.addClass('low-color');
					panelCard.removeClass('category-focused');
					$('#panel_'+categoryName).removeClass('low-color');

					$('#panel_'+categoryName).toggleClass('category-focused');
					entryContainer.empty();
					// console.log($(this).attr('haspw'));
					var ic = $(this).find('.lock-icon').text();
					var _hasPW = (ic == 'lock') ? true : false;
					// console.log("hasPW: " + _hasPW);
					displayCategoryHeader(catName, _hasPW); //update hasPW before displaying header
					controller.loadEntries(categoryName, false);
				}else{
					console.log("deselected");
					$('#panel_'+categoryName).toggleClass('category-focused');
					panelCard.addClass('low-color');
					var entryContainer = $('#entryContainer');
					var cardWrapper = entryContainer.parent();
					
					// entryContainer.fadeOut(200);

					// entryContainer.empty();
					// entryContainer.hide();
					fadeSlideDown(cardWrapper);
				}					
			});

			$('#cat-icon').attr('id',categoryName+'-icon')
			.html(getIcon(iconName));					
			$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);

		});
	});

		displayNumberEntries();	

		function getIcon(name){
			console.log("View : getIcon");
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
	};
	var displayCategoryHeader = exports.displayCategoryHeader = function(name, hasPW){
	var entryContainer = $('#entryContainer');
	var cardWrapper = entryContainer.parent();


		// cardWrapper.fadeIn(300);
		entryContainer.fadeIn(400);
		fadeSlideUp(cardWrapper);
		

		if(hasPW){
			entryContainer.append('<h2 class="row-header">'+name+'</h2><div><div id="pwhint_stored"><i class="material-icons hastext">lock</i><span class="pwd-hidden">*******</span><span type="cat" cat="'+name+'" class="showPW">show</span><a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div></div><hr>');
		}else{
			entryContainer.append('<h2 class="row-header">'+name+'</h2><div><i class="material-icons hastext">lock_open</i> No password stored. <a id="editCategory" class="link" data-toggle="modal" data-target="#modalCategory" oldValue="'+ name +'">Edit category</a></div><hr>');
		}
			//configure modal here (event.relatedTarget is created dynamically)
			setupModalCategory(hasPW);
			// setupShowButton();
		};
		var displayCategories = exports.displayCategories = function(loadUniqueEntries) {
			console.log("View : displayCategories");
			setupModalCategory(false);
			// setupShowButton();
			SL.getCategories(function(c){	
				var categories = c.categories;
				for(c in categories){				
			// console.log(c + " password: " + categories[c]);
			createCategoryElement(c,categories[c][0],categories[c][1], categories[c][2]);
		}

		if(loadUniqueEntries){
			require(["MVC_Model"], function(sm){
				sm.loadEntries(null, true);
			});
		}	
	});
		};
		var fillDropdown = exports.fillDropdown = function(categories) {
			console.log("View : fillDropdown");
			$('#categoryDropdown').empty();
			for(c in categories){
				var e = document.createElement('option');
				e.textContent = c;
				document.querySelector('#categoryDropdown').append(e);

			}
		};
		var createCategory = exports.createCategory = function(name, pw, isNew){
			console.log("View : createCategory");
			crypt.encrypt_aes(pw, function(data){

				var pw_enc = (pw=='') ? null : data;
				var oldName = $('#editCategory').attr('oldValue');
				var randID = guidGenerator();
				var cat = ["Info","folder", pw_enc ,randID];

				SL.getCategories(function(result){
					var mCat = result;
				//check if same name exists (--> override/change name or pw)
				// if(categories.categories != null && categories.categories[name] != null){
					toggleConfirm();
					$('#modalYes').on('click', function(event){
					// event.stopImmediatePropagation(); 
					//push new entry 
					mCat.categories[name] = cat;
					//store changes
					SL.setCategories(mCat, function(){
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
									reassignEntries(oldName, name, mCat);
								}
							}
						}else{
							console.log("no update. was new category");
							displayCategories(false);
						}
					});

					var icon = (pw==null) ? 'lock_open' : 'lock';
					$('#panel_'+name+' .lock-icon').html(icon);
				});
					$('#modalNo').on('click', function(event){
						event.stopImmediatePropagation(); 
						toggleConfirm();
					});
				});			
			});
		};
		var displayNumberEntries = exports.displayNumberEntries = function(){
			console.log("View : displayNumberEntries");
			SL.getCategories(function(catResults){
				var categories = catResults["categories"];
				SL.countEntries(categories, function(cKeys){
					console.log(cKeys);
					// cKeys[catname] = number;
					for(cKey in cKeys){
						if($('#numberAccounts_'+cKey) != null){
							$('#numberAccounts_'+cKey).html("Number Accounts: " + cKeys[cKey]);
						}
					}
				});
			});
		}
		var deleteCategory = exports.deleteCategory = function(category){
		//ask if sure
		//if category is not empty --> move entries to unsorted
		console.log("View : deleteCategory");
		var gettingCategories = browser.storage.local.get("categories");
		gettingCategories.then((results) => {
			var oldCategories = results.categories;					
			delete oldCategories[category];	

				//save the altered version of the entry-element in storage
				var storingCategories = browser.storage.local.set({"categories" : oldCategories});
				storingCategories.then(() => {
					//remove element from DOM 
					document.getElementById("wrapper_"+category).remove();
					displayCategories(true);
				}, onError);	

			});
	};
	var changeCategoryIcon = exports.changeCategoryIcon = function(catName, iconName){
		console.log("View : changeCategoryIcon");
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
				displayCategories(true);



			//console.log()
		}, onError);
			

		});
	};
	var moveToCategory = exports.moveToCategory = function(url, newCategory){
		console.log("View : moveToCategory");
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
				displayNumberEntries();


			//console.log()
		}, onError);
			

		});
	};
	var showPWInput = exports.showPWInput = function(){
		var storePW = ($('#btnAddPWD').text() === 'add password') ? true : false;
		var txt = (storePW) ? 'remove password' : 'add password';
		var msg = (storePW) ? 'A category password will be stored.' : 'No password will be stored for this category and its entries.';
		var icon = (storePW) ? 'lock':'lock_open';
		$('#btnAddPWD').html(txt);
		$('#pw-hint span').html(msg);
		$('#pw-hint i').html(icon);
		$('#category-pwd').val('');
		$('#enter-category-pwd').toggleClass('hidden');
	};
	var clearInputs = exports.clearInputs = function(){

		$('input').val('');
	}

	// private functions
	var setupModalCategory = function(hasPW){
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
	};
	var setupShowButton = function(){
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
	};
	var deleteThisEntry = function(url){
		console.log("View : deleteThisEntry");
		var gettingEntries = browser.storage.local.get("entries");
		gettingEntries.then((results) => {
			var oldEntries = results.entries;					
			delete oldEntries[url];	

				//save the altered version of the entry-element in storage
				var storingEntry = browser.storage.local.set({"entries" : oldEntries});
				storingEntry.then(() => {
					console.log("element " + url + " deleted. Entries updated.");
					displayNumberEntries();
				}, onError);	

			});
	};
	var httpGet = function(mpURL, mpCallback) {
		var mpHttpRequest = new XMLHttpRequest();
		mpHttpRequest.onreadystatechange = function() { 
			if(mpHttpRequest.status === 404){
				mpCallback(null);
			}else if (mpHttpRequest.readyState == 4 && mpHttpRequest.status == 200)
			mpCallback(mpHttpRequest.responseText);
		}
		mpHttpRequest.open( "GET", mpURL, true );            
		mpHttpRequest.send( null );
	};
	var toggleConfirm = function(){
		console.log("View : toggleConfirm");
		$('#modalYesNo').toggleClass('hidden');
		$('#modalAction').toggleClass('hidden');
	};
	var guidGenerator = function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	var reassignEntries = function(oldName, name, categories){
		console.log("View : reassignEntries");
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
				SL.setEntries(newEntries, function(){
					console.log("store success");
					displayNumberEntries();
					fillDropdown(categories.categories);

				}, onError);
			}else{
				fillDropdown(categories.categories);
			}

		});
	};
	var fadeSlideUp = function(element){
		var entryContainer = $('#entryContainer');
		element.animate({ opacity: 1 }, { duration: 200, queue: false });
		element.animate({ "margin-top": "-10px" }, { duration: 200, queue: false });
		entryContainer.animate({ opacity: 1 }, { duration: 200, queue: false });
	};
	var fadeSlideDown = function(element){
		var entryContainer = $('#entryContainer');
		setTimeout(function() {
			entryContainer.empty();
		}, 410);
		entryContainer.animate({ opacity: 0 }, { duration: 400, queue: false });
		element.animate({ opacity: 0 }, { duration: 400, queue: false });
		element.animate({ "margin-top": "10px" }, { duration: 400, queue: false });
	};
	var onError = function(e){
		console.log(e);
	}


	return exports;
});
