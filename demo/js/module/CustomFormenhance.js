define(["sha256"],function(){
  var log=decj.App.log;
 return {
    resources:['res/demo-basic'],
    screen:'UpdateRegInfo.htm',
    css:["form.css","decj.css"],
    metaDataURL:'handler.php?src=metaData.json',
    validators:{
      "valueConfirm":function(value,params){
        var result={valid:true};
        if(document.forms[0]['passwd'].value!=document.forms[0]['passwd-re'].value){
            result.valid=false;
            result.message=decj.msg("pwd.not.match",params);
        }
        return result;
      }
    },
    forms:{
      "userInfo":{
        resident:true,
        encodingType:'application/x-www-form-urlencoded',//Submit form data as URL-encoded data
        filter:function(form,data,originalData){/*Make some extra processing on packaged form data*/
          var passwdPair;
          for(var i=data.length-1;i>0;i--){
            if('passwd'==data[i].name){//passwd
                passwdPair=data[i];
                break;
            }
          }
          var pwd=passwdPair.value;
          var pwdHash=CryptoJS.SHA256(pwd).toString();
          passwdPair.value=pwdHash;
        },
        submitSuccess:function(data){/*This is a callback that will be invoked after a form is successfully submitted*/
          alert("Server date:"+data.date+"\n"+"res form.submit.ok".val({memberId:data.id}));
        },
        validation:{/*Declare extra validation rules for a form field*/
          "passwd":{"valueConfirm":{}},
          "passwd-re":{"valueConfirm":{}}
        }
      }
    },
    events:{
        "click@#chkShowLog":function(){
            $("#log").toggle();
        },
        "click@#chkDemoExpl":function(){
           var alreadyLoaded=$('#demoExplain').data('explLoaded');
           if(alreadyLoaded){
            $('#demoExplain').toggle();
           }else{
            log("Load demo explanation...");
            decj.loadModule("module/UpdateRegInfoExplain",{viewTarget:'demoExplain',resident:true,locale:$('#demoExplain').data('locale')});
            $('#demoExplain').data('expl-loaded',true);
           }  
        },
        "change@[name=lang]":function(){
           var locale=$(this).val();
           if(""!=locale){
            var answer=confirm(decj.msg("change.lang.tip"));
            if(answer){
              decj.App.locale=locale;
              decj.loadModule('module/UpdateRegInfoStatic',{
                resident:false,
                httpRequest:{
                    url:'handler.php?src=userInfoData.json'
                }
              });
              $('#demoExplain').data('explLoaded',false);
            }
           }
        },
        "click@#unloadModule":function(){
          decj.unloadModule('wkspc');
        }
    },
    preInit:function(){
        log("HTML/CSS/Javascript loaded for the demo module.");
    },		
    init:function(){
        $('[name=lang]').val(decj.App.locale);
        log("The demo initilized");
        log("Loader was loaded",new Date(window._phpLoaderLoadTime || performance.timing.loadEventStart));
    },
    finalize:function(){
        $("#log").html('');
        log=null;
        decj.unloadModule("demoExplain");
    }	
};
});