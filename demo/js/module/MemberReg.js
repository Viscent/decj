define(["decj"],function(decj){
  var log=decj.App.log;
 return {
    resources:['res/demo-basic'],/*Declare resource files required by this module*/
    screen:'UpdateRegInfo.htm',
    css:["form.css","decj.css"],
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
        //encodingType:"application/x-www-form-urlencoded",
        filter:function(form,data,originalData){/*Make some extra processing on packaged form data*/
          var pwd=data.passwd;
          var pwdHash=CryptoJS.SHA256(pwd).toString();
          data.passwd=pwdHash;
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
      "click@#chkDemoExpl":function(){/*Declare an event handler for click event on HTML element whose ID is btnDemoExpl */
         var alreadyLoaded=$('#demoExplain').data('explLoaded');
         if(alreadyLoaded){
          $('#demoExplain').toggle();
         }else{
          log("Load demo explanation...");
          //Load moudle module/UpdateRegInfoExplain
          "module module/UpdateRegInfoExplain".val({
            viewTarget:'demoExplain',
            resident:true,
            locale:$('#demoExplain').data('locale')});
          $('#demoExplain').data('expl-loaded',true);
         }  
      },
      "change@[name=lang]":function(){/*Declare an event handler for change event on HTML element whose name is lang */
         var locale=$(this).val();
         if(""!=locale){
          var answer=confirm("res change.lang.tip".val());
          if(answer){
            decj.App.locale=locale;
            //Load moudle module/UpdateRegInfoStatic
            'module module/UpdateRegInfoStatic'.val({
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
      $('#progressTip').css('display','none');
      $('[name=lang]').val(decj.App.locale);
      log("The demo initilized");
      log("Page was loaded",new Date(window.pageLoadeTime || performance.timing.loadEventStart));
      require(["sha256"]);//Delay the loading of this dependency
    },
    finalize:function(){
      $("#log").html('');
      log=null;
      decj.unloadModule("demoExplain");
    }	
};
});

