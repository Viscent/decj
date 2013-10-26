define(['jquery','decj'],function(jQuery,decj){

  return {
    css:"visibility.css",
    screen:"module1UI.htm",
    //Declarative event bindings
    events:{
      "click@a":function(){
        $(this).html("clicked");
      },
      "click@#load2DefaultVT":function(){
        "module module/decjModuleLoad/module2".val();
      },
      "click@#load2AnotherVT":function(){
        "module module/decjModuleLoad/module2".val({viewTarget:"viewTarget1"});
      }
    },
    init:function(){
     $('#module1LoadState').html('done');
    }
  };
});