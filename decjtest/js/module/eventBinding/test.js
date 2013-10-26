define(['jquery','decj'],function(jQuery,decj){

  return {
    //Declarative event bindings
    events:{
      "click@#btnTest1":function(){
        $(this).val("clicked");
      },
      "change@[name=sltBox1]":function(){
        $("#itemSelected").html("Item selected!");
      },
      "blur@.class1":function(){
        $("#focusLost").html("Focus lost!");
      }
    },
    init:function(){
     $('#loadingState').html('done');
     //Programmatic event bindings
     "event click@a".val(function(){
        alert($(this).attr('href'));
        return false;
     });
    }
  };
});
