define(['jquery','decj','jquery.mockjax'],function(jQuery,decj){

  return {
    css:"visibility.css",
    screen:"module1UI.htm",
    preInit:function(){
      //Mock ajax response that we need later
      $.mockjax({
        url: 'moduleGenerator.php?src=userInfoData.json',
        contentType: 'text/json',
        headers:{
          "X-JS":"module/decjModuleLoad/module2",
          "X-Screen":"module2UI.htm",
          "X-CSS":"visibility1.css"
        },
        proxy: '../userInfoData.json'
      });
      $.mockjax({
        url: 'handler.php?src=userInfoData.json',
        contentType: 'text/json',
        headers:{
          "X-JS":"module/decjModuleLoad/module3"
        },
        proxy: '../userInfoData.json'
      });
    },
    //Declarative event bindings
    events:{
      "click@a":function(){
        $(this).html("clicked");
      },
      "click@#loadModule":function(){
        decj.loadModule({
          httpRequest:{
            url:"moduleGenerator.php?src=userInfoData.json",
            data:{
              name:"Test",
              value:"Dynamic",
            }
          },
          viewTarget:"viewTarget1"
        });
      },
      "click@#loadModuleWithoutUI":function(){
        decj.loadModule({
          httpRequest:{
            url:"handler.php?src=userInfoData.json",
            data:{
              name:"Test",
              value:"Dynamic",
            }
          }
        });
      }
    },
    init:function(){
     $('#module1LoadState').html('done');
    }
  };
});