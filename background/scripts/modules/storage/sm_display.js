/* display entries */
define(['scripts/modules/storage/sm_category'],function(sm_category) {
	return {
		displayEntry: function(url, credential) {
			console.log("Function : displayEntry");

			var entryContainer = document.querySelector('#listGroup_'+credential.category+' .list-group');
			//check if there is a category element for this category (should be if well-created)
		

			var entry = document.createElement('div');
			var entryDisplay = document.createElement('div');
			var entryH = document.createElement('p');
			
			var entryPara2 = document.createElement('p');
			var deleteBtn = document.createElement('button');
			var clearFix = document.createElement('div');

			entry.setAttribute('class','entry');

			entryH.textContent = url;
			
			entryPara2.textContent = credential.username;

			deleteBtn.setAttribute('class','delete');
			deleteBtn.setAttribute('id', url);
			deleteBtn.textContent = 'Delete entry';
			clearFix.setAttribute('class','clearfix');
			

			entryDisplay.appendChild(entryH);
	
			entryDisplay.appendChild(entryPara2);
			entryDisplay.appendChild(deleteBtn);
			entryDisplay.appendChild(clearFix);

			entry.appendChild(entryDisplay);

			function deleteThisEntry(url){
				console.log("Function : deleteThisEntry");

				var gettingEntries = browser.storage.local.get("entries");

				gettingEntries.then((results) => {
					var oldEntries = results.entries;					
					delete oldEntries[url];	
					
					//save the altered version of the entry-element in storage
					var storingEntry = browser.storage.local.set({"entries" : oldEntries});
					storingEntry.then(() => {
						console.log("element" + url + "deleted. Entries updated.");

					}, onError);

			//save it again
		});
			}

			//id (== url) is saved in button
			deleteBtn.addEventListener('click',function(e){
				evtTgt = e.target;
				//TODO adapt to new storage design
				deleteThisEntry(evtTgt.getAttribute('id'));

				//remove from DOM
				evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);		
				
			})

			var entryEdit = document.createElement('div');
			var entryCategoryEdit = document.createElement('input');
			var entryurlEdit = document.createElement('textarea');
			var clearFix2 = document.createElement('div');

			var updateBtn = document.createElement('button');
			var cancelBtn = document.createElement('button');

			updateBtn.setAttribute('class','update');
			updateBtn.textContent = 'Update entry';
			cancelBtn.setAttribute('class','cancel');
			cancelBtn.textContent = 'Cancel update';

			entryEdit.appendChild(entryCategoryEdit);
			entryCategoryEdit.value = url;
			entryEdit.appendChild(entryurlEdit);
			entryurlEdit.textContent = credential.category;
			entryEdit.appendChild(updateBtn);
			entryEdit.appendChild(cancelBtn);

			entryEdit.appendChild(clearFix2);
			clearFix2.setAttribute('class','clearfix');

			entry.appendChild(entryEdit);

			entryContainer.appendChild(entry);
			entryEdit.style.display = 'none';


			entryH.addEventListener('click',function(){
				entryDisplay.style.display = 'none';
				entryEdit.style.display = 'block';
			})

			

			cancelBtn.addEventListener('click',function(){
				entryDisplay.style.display = 'block';
				entryEdit.style.display = 'none';
				entryCategoryEdit.value = credential.category;
				entryurlEdit.value = url;
			})

			updateBtn.addEventListener('click',function(){
				if(entryCategoryEdit.value !== credential.category || entryurlEdit.value !== url) {
					updateentry(credential.category,entryCategoryEdit.value,entryurlEdit.value);
					entry.parentNode.removeChild(entry);
				} 
			});
			
		}
		

		
	}

});


