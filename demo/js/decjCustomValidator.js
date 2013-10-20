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
    cssBaseURL:'//static.viscenthuang.info/decj/demo/css/',
    validators:{
      FieldMatches:function(value,param){
        var field1=param.field1,
        field2=param.field2,
        result={};
        if(value==$(field1).val() && $(field2).val()==value){
           result.valid=true; 
        }else{
            result.valid=false; 
            result.message='res FieldMatches'.val({
              field1:$(field1).attr('title') || $(field1).attr('name'),
              field2:$(field2).attr('title') || $(field2).attr('name')
            });
        }
        return result;
      } 
    },
    initialModule:'module/CustomValidator'
  };
}