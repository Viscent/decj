define(["decj","sha256"],function(decj){
 return {
    resources:['res/form'],
    screen:'UpdateRegInfo.htm',
    //css:["form.css","decj.css"],
    metaDataURL:'handler.php?src=metaData.json',
    validators:{
      "valueConfirm":function(value,params){
        var result={valid:true};
        if(document.forms[0]['passwd'].value!=document.forms[0]['passwd-re'].value){
          result.valid=false;
          result.message="res pwd.not.match".val(params);
        }
        return result;
      }
    },
    forms:{
      "userInfo":{
        resident:true,
        method:'PUT',
        filter:function(form,data,originalData){/*Make some extra processing on packaged form data*/
          var pwd=data.passwd;
          var pwdHash=CryptoJS.SHA256(pwd).toString();
          data.passwd=pwdHash;
        },
        submitSuccess:function(data){/*This is a callback that will be invoked after a form is successfully submitted*/
          //alert("Server date:"+data.date+"\n"+"res form.submit.ok".val({memberId:data.id}));
          $('#submittedData').val(JSON.stringify(data));
        },
        validation:{/*Declare extra validation rules for a form field*/
          "passwd":{"valueConfirm":{}},
          "passwd-re":{"valueConfirm":{}}
        }
      }
    },	
    init:function(){
      $('#moduleLoadState').html('done');
    }
};
});