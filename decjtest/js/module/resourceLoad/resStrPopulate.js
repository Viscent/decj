define(['jquery','decj'],function(jQuery,decj){

  return {
    resources:"res/resource1",
    init:function(){
     $('#loadingState').html('done');
     //Programmatically resouce consuming
     $("#publisher").html("res publisher".val({publisher:"Computers Publish House"}));
     alert("res publisher".val());
    }
  };
});
