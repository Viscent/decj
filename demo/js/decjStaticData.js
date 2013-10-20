if(window.performance && window.performance.timing){
  window.pageLoadeTime=performance.timing.loadEventStart;
}else{
  window.pageLoadeTime=new Date().getTime();
}
function decjApp(decj){
  return {
    amd:{
      baseUrl:'../js/lib',
      paths: {
        module: '../module',
        JSON:'//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.min',
        jquery:'//code.jquery.com/jquery-1.8.0.min',
        cssloader:'//static.viscenthuang.info/decj/demo/js/lib/cssloader.min',
        sha256:'//crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256',
        res:'//static1.viscenthuang.info/decj/demo/res/'
      },
      shim:{
        decj:{
            deps:['jquery','cssloader']
        }
      }
    },
     log:function(msg,date){
        var html=document.getElementById('log').innerHTML;
        var d=date || new Date();
        var h=d.getHours();
        h=(h>=10) ? h : "0"+h;
        var m=d.getMinutes();
        m=(m>=10) ? m : "0"+m;
        var s=d.getSeconds();
        s=(s>=10) ? s : "0"+s;
        var ms=d.getMilliseconds();
       
        var ts=h+":"+m+":"+s+"."+ms;
        document.getElementById('log').innerHTML=(html+"<br/>["+ts+"]:"+msg);
      },
      cssBaseURL:'//static.viscenthuang.info/decj/demo/css/',
      initialModule:['module/UpdateRegInfoStatic',{
        data:{"userInfo":{
          "lastName":"Framework",
          "firstName":"decj",
          "gender":"Male",
          "email":"decj@viscenthuang.info",
          "birthdate":318268800000,
          "prefLang":"English",
          "expertise":["html","oracedb","Javascript","java"],
          "notification":["SMS","email"],
          "mobilephone":"13612345678",
          "intro":"decj is a lightweight javascript framework. By taking advantages of JSON and AMD,it enables solving common issues elegantly in the client-side web development in a declarative and modular way.Declarative programming means we can achieve the same thing or even more with less code compared with imperative programming.All features supported by the framework do NOT require you write imperative code,you just declare what you need to do.",
          "mgmtExpr":1032.56
          }
        } 
    }]
  };
}