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
        module: '//decj.viscenthuang.info/demo/js/module',
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
    initialModule:{
      httpRequest:{
        url:'moduleGenerator.php?src=userInfoData.json'
      }
    }
  };
}
