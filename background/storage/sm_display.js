/* display entries */
define(function(sm_display) {
	return {
		displayEntry: function(url, credential) {
			console.log("Function : displayEntry");

			var entry = document.createElement('div');
			var entryDisplay = document.createElement('div');
			var entryH = document.createElement('p');
			var entryPara = document.createElement('p');
			var entryPara2 = document.createElement('p');
			var entryPara3 = document.createElement('p');
			var deleteBtn = document.createElement('button');
			var clearFix = document.createElement('div');

			entry.setAttribute('class','entry');

			entryH.textContent = url;
			entryPara.textContent = credential.category;
			entryPara2.textContent = credential.username;
			entryPara3.textContent = 'pw hidden';

			deleteBtn.setAttribute('class','delete');
			deleteBtn.textContent = 'Delete entry';
			clearFix.setAttribute('class','clearfix');

			entryDisplay.appendChild(entryH);
			entryDisplay.appendChild(entryPara);
			entryDisplay.appendChild(entryPara2);
			entryDisplay.appendChild(entryPara3);
			entryDisplay.appendChild(deleteBtn);
			entryDisplay.appendChild(clearFix);

			entry.appendChild(entryDisplay);



			deleteBtn.addEventListener('click',function(e){
				evtTgt = e.target;
				evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
				browser.storage.local.remove(url);
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

			entryPara.addEventListener('click',function(){
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


