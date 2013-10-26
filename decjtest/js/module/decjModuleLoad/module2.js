define(['jquery','decj'],function(jQuery,decj){

  return {
    css:"visibility1.css",
    screen:"module2UI.htm",
    //Declarative event bindings
    events:{
      "click@.emphasize":function(){
        $(this).html("clicked");
      }
    },
    init:function(){
     $('#module2LoadState').html('done');
    }
  };
});