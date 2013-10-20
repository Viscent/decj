define(function(){
 return {
    resources:'res/demo-custom-validator',
    css:"form.css",
    metaDataURL:'handler.php?src=ChPwdMetaData.json',
    forms:{
      "memberInfo":{
        resident:true,
        submitSuccess:function(data){/*This is a callback that will be invoked after a form is successfully submitted*/
            alert("Server date:"+data.date+"\n"+"res form.submit.ok".val({memberId:data.id}));
        }
      }
    }
};
});
