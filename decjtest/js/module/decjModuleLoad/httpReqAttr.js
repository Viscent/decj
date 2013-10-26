define(['jquery','decj','jquery.mockjax'],function(jQuery,decj){

  return {
    init:function(){
     $('#moduleLoadState').html('done');
     var data=this.data.userInfo;
     $('#title').html(data.firstName+' '+data.lastName);
    }
  };
});