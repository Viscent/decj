define(['jquery','decj'],function(jQuery,decj){

  return {
    init:function(){
     $('#module2LoadState').html('done');
     alert(this.data.userInfo.firstName);
    }
  };
});