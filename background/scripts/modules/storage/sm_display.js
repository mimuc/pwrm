/* display entries */
define(['psl','jquery','scripts/modules/storage/sm_category'],function(psl,$,sm_category) {
	return {
		displayEntry: function(url, credential) {
			console.log("Function : displayEntry");
			//var entryContainer = document.querySelector('#listGroup_'+credential.category+' .list-group');
			var entryContainer = document.querySelector('#entryContainer');
			//check if there is a category element for this category (should be if well-created)
			var entryWrapper = document.createElement('div');
			entryWrapper.setAttribute('id', 'entryWrapper_'+credential.id);
			entryWrapper.setAttribute('class', 'entry-row row');
			entryContainer.appendChild(entryWrapper);

			var turl = url.split("/")[2]; // Get the hostname
			var parsed = psl.parse(turl); // Parse the domain
			var urlName = parsed.sld;

			var wrapper = $('#entryWrapper_'+credential.id);
			wrapper.append('<div class="col-lg-2"><a href="http://placehold.it"><img class="placeholder-img" src="http://placehold.it/40x40"></a>'+ urlName +'</div><div class="col-lg-4">'+ url +'</div><div class="col-lg-2">'+ credential.username +'</div><div class="col-lg-4"><div class="row"><div class="col-lg-6">01.01.17</div><div class="col-lg-2"><a class="btn btn-mp light">Edit</a></div><div class="col-lg-2"><a id="'+ url +'" class="btn btn-mp light">Delete</a></div><div class="col-lg-2"><a id="open_'+credential.id+'" class="btn btn-mp light">Goto</a></div></div></div>');
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
				evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);		
				
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
