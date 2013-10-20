define(function(decj){
 return {
    css:"form.css",
    metaDataURL:'handler.php?src=CstTypeMetaData.json',
    forms:{
      "demoForm":{
        resident:true,
        validation:{
            "amount":{"typeParam":{"fraction":2,"currencySetter":function(){
                return document.forms[0]['currency'].value;
            }}}
        }
      }
    },
    events:{
      "change@#currency":function(){
        var newCurrency=$(this).val();
        var $amount=$("[name='amount']","form[name='demoForm']");
        $amount.val($amount.val().substring(1)).blur();
      }
    }
};
});