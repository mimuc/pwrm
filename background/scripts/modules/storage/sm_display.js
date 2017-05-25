/* display entries */
define(['scripts/modules/tools/showPW', 'psl','jquery','scripts/modules/storage/sm_category'],function(showPW,psl,$,sm_category) {
	return {
		displayEntry: function(url, credential, hasCategory) {
			//console.log("Function : displayEntry, url: " + url + ", hasCat: " + hasCategory);
			console.log("Function: displayEntry");
			var entryContainer, content;

			var turl = url.split("/")[2]; // Get the hostname
			var parsed = psl.parse(turl); // Parse the domain
			var urlName = parsed.domain;

			if(credential.category != null){
				entryContainer = document.querySelector('#entryContainer');
				content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-6">01.01.17</div><div class="entry-actions"><div class="col-lg-2"></div><div class="col-lg-2"><a><i id="'+ url +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.id+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}else{
				entryContainer = document.querySelector('#uniqueEntryContainer');
				content = '<div class="col-lg-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3">'+ url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-3">01.01.17</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2"><span type="unique" url="'+url+'" class="showPW">show</span></div><div class="col-lg-2"><a><i id="'+ url +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.id+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}

			var entryWrapper = document.createElement('div');
			entryWrapper.setAttribute('id', 'entryWrapper_'+credential.id);
			entryWrapper.setAttribute('class', 'entry-row row');
			entryContainer.appendChild(entryWrapper);

			


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
						sm_category.displayNumberEntries();
					}, onError);	

				});
			}


			
		}
	}
});
