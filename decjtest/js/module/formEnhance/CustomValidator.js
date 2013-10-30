define(function(){
 return {
    metaDataURL:'handler.php?src=ChPwdMetaData.json',
    forms:{
      "memberInfo":{
        submitSuccess:function(data){
            alert("Server date:"+data.date+"\n"+"res form.submit.ok".val({memberId:data.id}));
        }
      }
    },
    init:function(){
      $('#moduleLoadState').html('done');
    }
};
});