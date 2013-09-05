define(function(){

 function centerDialog(){
    var h=($(document).height()-$('#loginPanel').height())/2;
    $('#loginPanel').css({'position':'absolute','top':h});
    var w=($(document).width()-$('#loginPanel').width())/2;
    $('#loginPanel').css('left',w);
 }
 
 function showDialog(html){
    $('#loginPanelContainer').html(html);
    var eleDiv=document.createElement('DIV');
    $(document.body).append(eleDiv);
    eleDiv.innerHTML='&nbsp;';
    eleDiv.setAttribute('class','mask');

    $(eleDiv).css({
        position:'absolute',
        opacity:'0.12',
        top:'0px',
        left:'0px',
        width:'100%',
        height:'100%',
        "z-index":100,
        "background-color":'rgb(0, 0, 0)',
        margin:'0px 0px 0px 0px'
    });
    $(window).resize(centerDialog);
    centerDialog();
 }
 
 return {
    resources:['res/demo-basic'],
    css:["form.css","decj.css"],
    events:{
      "click@[name=btnTest]":function(){
        alert('Button ['+this.value+'] was clicked!');
      },
      "click@#loadModule":function(){
        var dialogPainted=$('#loginPanelContainer').data('dialogPainted');
        if(!dialogPainted){
          'module module/CustomViewrenderLogin'.val({
          viewRender:function(html){
            showDialog(html);
            $('#loginPanelContainer').data('dialogPainted',true);
          },
          resident:false//Declare the module to load as a resident module
          }
         ); 
        }else{
          $('#loginPanelContainer').css('display','block');
          $('.mask').css('display','block');
        }
       }   
    }
};
});