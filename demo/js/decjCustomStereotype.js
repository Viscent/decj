function decjApp(){
  var _currencySign={USD:'$',CNY:'￥',EUR:'€'};
  
  return {
    amd:{
      baseUrl:'../js/lib',
      paths: {
        module: '../module',
        JSON:'//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.min',
        jquery:'//code.jquery.com/jquery-1.8.0.min',
        cssloader:'//static.viscenthuang.info/decj/demo/js/lib/cssloader.min'
      },
      shim:{
        decj:{
            deps:['jquery','cssloader']
        }
      }
    },
    cssBaseURL:'//static.viscenthuang.info/decj/demo/css/',
    types:{
      Currency:{
        parent : 'Decimal',
        isValid:function(value,param){
          var currency=(param || {})['currencySetter']();
          var currencySign=_currencySign[currency];
          value=value || '';
          value=value.replace(currencySign,'');
          return decj.StereoType.of('Decimal').isValid(value,param);
        },
        parser:function(value,param){
          var currency=(param || {})['currencySetter']();
          var currencySign=_currencySign[currency];
          value=value || '';
          value=value.replace(currencySign,'');
          value=decj.StereoType.of('Decimal').parse(value,param);
          return value;
        },
        formatter:function(value,param){
          var currency=(param || {})['currencySetter']();
          var currencySign=_currencySign[currency];
          value=decj.StereoType.of('Decimal').format(value,param);
          return currencySign+value;
        }
      }
     },
    initialModule:'module/CustomStereotype'
  };
}