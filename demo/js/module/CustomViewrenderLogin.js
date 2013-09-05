define(function(){
 return {
    screen:'login.htm',
    css:["form.css","decj.css"],
    events:{
      "click@#cancelLogin":function(){
         $('#loginPanelContainer').css('display','none');
         $('.mask').css('display','none');
      }  
    }
};
});