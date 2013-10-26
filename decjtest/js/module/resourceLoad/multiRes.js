define(['jquery','decj'],function(jQuery,decj){

  return {
    resources:["res/resource1","res/resource2","res/resource3"],
    init:function(){
     $('#loadingState').html('done');
    }
  };
});
