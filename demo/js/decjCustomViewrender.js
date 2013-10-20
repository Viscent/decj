function decjApp(decj){
  return {
    amd:{
      baseUrl:'../js/lib',
      paths: {
        module: '../module',
        JSON:'//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.min',
        jquery:'//code.jquery.com/jquery-1.8.0.min',
        cssloader:'//static.viscenthuang.info/decj/demo/js/lib/cssloader.min',
        res:'//static1.viscenthuang.info/decj/demo/res/'
      },
      shim:{
        decj:{
            deps:['jquery','cssloader']
        }
      }
    },
   cssBaseURL:'//static.viscenthuang.info/decj/demo/css/',
   initialModule:'module/CustomViewrender'
  };
}