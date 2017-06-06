define(["MVC_Model", "MVC_View_Managerpage", "scripts/tools/showPW"],function(MVC_Model, MVC_View_Managerpage, showPW){
  return{
    changeCategoryIcon : function(catName, iconName){
      MVC_View_Managerpage.changeCategoryIcon(catName, iconName);
    },
    deleteCategory: function(name){
      MVC_View_Managerpage.deleteCategory(name);
    },
    displayEntry : function(mUrl, credential, hasCategory){
      console.log("Controller : displayEntry");
      MVC_View_Managerpage.displayEntry(mUrl, credential, hasCategory);
    },
    fillDropdown : function(categories){
      console.log("Controller : fillDropdrown");
      MVC_View_Managerpage.fillDropdown(categories);
    },
    displayCategories : function(categories, loadEntries){
      console.log("Controller : displayCategories");
      MVC_View_Managerpage.displayCategories(categories, loadEntries);
    },
    displayNumberEntries : function(){
      console.log("Controller : displayNumberEntries");
      MVC_View_Managerpage.displayNumberEntries();
    },
    createCategory : function(){
      var value = modalCategoryName.value;  var pw; var ecpwd = $('#category-pwd');
      if(ecpwd.hasClass('hidden')){ 
        pw = null;
      }else{ pw = ecpwd.val(); }

      MVC_View_Managerpage.createCategory(value, pw, $('#modalCategory').hasClass('new'));
    },
    addEntry : function(){
      /* TODO: needs form checks */
      MVC_Model.addEntry();
    },
    quickAddEntry : function(murl, musername, mcat, mpw){
      /* TODO: needs form checks */
      console.log(murl);
      MVC_Model.quickAddEntry(murl, musername, mcat, mpw);
    },
    requestPassword : function(mUrl, type, mHash, sendResponse){
      //ATTENTION!
      //must be called from background.js TODO
      console.log("Function : requestPassword");
      showPW.trigger(null, type, mUrl, mHash, function(result){
        sendResponse(result);
      });
    }

}
});


















