// DON'T DEFINE MVC_MODEL HERE => circular dependency
// solution: reuqire on demand
define(['MVC_View_Managerpage', 'scripts/tools/showPW', 'psl'],
  function(view, showPW, psl){
    var exports = {};

    var changeCategoryIcon = exports.changeCategoryIcon = function(catName, iconName){
      console.log("Controller : changeCategoryIcon");
      view.changeCategoryIcon(catName, iconName);
    };
    var deleteCategory = exports.deleteCategory = function(name){
      console.log("Controller : deleteCategory");
      view.deleteCategory(name);
    };
    var search = exports.search = function(value){
       require(['MVC_Model'], function(MVC_Model){
        MVC_Model.search(value);
      });
    };
    var displaySearchResults = exports.displaySearchResults = function(results){
      view.displaySearchResults(results);
    };
    var displayEntry = exports.displayEntry = function(randID, credential, hasCategory){
      console.log("Controller : displayEntry");
      var mUrl = credential.url;
      var turl = mUrl.split("/")[2]; // Get the hostname
      var parsed = psl.parse(turl); // Parse the domain
      var urlName = parsed.domain;
      urlName = urlName.split(".")[0];

      view.displayEntry(randID, urlName, credential, hasCategory);
    };
    var fillDropdown = exports.fillDropdown = function(categories){
      console.log("Controller : fillDropdown");
      view.fillDropdown(categories);
    };
    
    var displayCategories = exports.displayCategories = function(categories, loadEntries){
      console.log("Controller : displayCategories");
      view.displayCategories(categories, loadEntries);
    };
    var displayNumberEntries = exports.displayNumberEntries = function(){
      console.log("Controller : displayNumberEntries");
      view.displayNumberEntries();
    };
    var createCategory = exports.createCategory = function(){
      var value = modalCategoryName.value;
      value = value.replace(' ', '_');
      console.log(value);
      var pw; var ecpwd = $('#category-pwd');
      if(ecpwd.hasClass('hidden')){ 
        pw = null;        
      }else{
        pw = ecpwd.val();
      }

      view.createCategory(value, pw, $('#modalCategory').hasClass('new'));
    };
    var addEntry = exports.addEntry = function(){
      console.log("Controller : addEntry");
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.addEntry();
      });
    };
    var loadEntries = exports.loadEntries = function(categoryName, onlyUnique){
      console.log("Controller : loadEntries");
     require(['MVC_Model'], function(MVC_Model){
      MVC_Model.loadEntries(categoryName, onlyUnique);
    });
   };
   var quickAddEntry = exports.quickAddEntry = function(murl, musername, mcat, mpw){
    /* TODO: needs form checks */
    console.log("Controller : quickAddEntry");
    require(['MVC_Model'], function(MVC_Model){
      MVC_Model.quickAddEntry(murl, musername, mcat, mpw);
    });
  };
  var requestPassword = exports.requestPassword = function(mUrl, type, mHash, mCategory){
      //ATTENTION!
      //must be called from background.js TODO
      console.log("Function : requestPassword");
      showPW.trigger(null, type, mUrl, mHash, mCategory, function(result){
        var msg = {action : "requestPW", content: result};
        // does only work when backgroundpage is opened?!
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
          chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
            console.log(response);
          }); 
        });
      });
    };
    

    return exports;
  });


















