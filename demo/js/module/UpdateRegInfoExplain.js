define(function(){

 return {
  resources:"res/demo-explain",
  "css":"../css/basic-explain.css",
	"screen":"demo-explain/basic.htm",
	events:{
    "click@a":function(){
      var p=$(this).attr("_p");
      if(p){
         $("#"+p).toggle();
      }
    },
    "click@#chkExpandAll":function(){
     $('a[_p]').click();
    }
	},	
	init:function(data){
    decj.App.log('Demo explanation inited.');
	},
  finalize:function(){
    $("#log").html('');
  }
};
});