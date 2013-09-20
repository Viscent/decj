/*!
 * decj Framework---eases your daily web frontend dev with declarative prograrmming
 * https://code.google.com/p/decj
 *
 * Copyright(C) 2013 Viscent Huang (viscent.huang@gmail.com)
 *
 */
define('decj',(/*dependencies*/function(){
  var dependencies=['jquery','cssloader'];
  if('function'==typeof window.decjApp){
    var config=decjApp.config=decjApp();
    if(config.amd){
      require.config(config.amd);
    }
  }
  var JSON=window.JSON;
  if(!(JSON && JSON.parse && JSON.stringify)){
    dependencies.push('JSON');
  }
  return dependencies;
})(),
function($, CSS) {
		var _decj, _debug = false, EMPTY_OBJ = {}, EMPTY_ARR = [], dummy = function() {};

		if (window.ActiveXObject) {
			window.console = {
				log : function() {
				}
			};
		}

		//Begin declaration for some utility function
		function throwErr(name, msg) {
			var err = new Error();
			err.name = name;
			err.message = msg;
			throw err;
		}

    function ajaxFailed(xhr,status,error,operation){
        throwErr(operation,status+':\n'+error);
    }
        
		function Track(name) {
			this.name = name;
		}
		Track.attach = function(name) {
			if (!_debug) {
				return;
			}
			return new Track(name);
		}

		function debug(msg, date) {
			if (!_debug) {
				return;
			}
			var d = date || new Date();
			var h = d.getHours();
			h = (h >= 10) ? h : "0" + h;
			var m = d.getMinutes();
			m = (m >= 10) ? m : "0" + m;
			var s = d.getSeconds();
			s = (s >= 10) ? s : "0" + s;
			var ms = d.getMilliseconds();

			var ts = '[' + h + ":" + m + ":" + s + "." + ms + ']:';
			if (window.console) {
				console.log(ts, msg);
			}
		}

		function normalizeArray(arr) {
      var result;
      if($.isArray(arr)){
        result=arr;
      }else{
        result=[];
        if(undefined!=arr){
          result=result.concat(arr);
        }
      }
			return result;
		}
    
    function isSameArr(arr1,arr2,strict){
      if(arr1.length!=arr2.length){
        return false;
      }
      var tmp={},
      e1,e2,
      len=arr1.length;
      for(var i=len-1;i>=0;i--){
        tmp[(e1=arr1[i])]=1;
      }

      for(var i=len-1;i>=0;i--){
        e2=arr2[i];
        if(strict && e1!=e2){
          return false;
        }
        delete tmp[e2];
      }
      for(var attr in tmp){
        if(tmp.hasOwnProperty(attr)){
          len=-1;
          break;
        }
      }
      return (-1!=len);
    }
    //modified on 2013-09-08
    var _Array$push=Array.prototype.push;
		function Anonymous() {
			return function() {
				//var allArgs = [],
				var allArgs=arguments,
				self = arguments.callee,
				extraArg = self.extraArg,
        r;//return value
        /*
        for ( var len = arguments.length, i = 0; i < len; i++) {
          allArgs.push(arguments[i]);
        }
        if(undefined!==extraArg){
          allArgs = allArgs.concat(extraArg);
        }*/
        
        if(undefined!==extraArg){
          extraArg=normalizeArray(extraArg);
          _Array$push.apply(allArgs,extraArg);
        };
        //modification end 2013-09-08
				r = self.delegate.apply(self.ctx, allArgs);
				if (true != self.resident) {
					self.ctx = self.extraArg = self.delegate = null;
				}
				return r;
			};
		}

		Function.prototype.transform = function(extraArg, exeCtx) {
			var func = Anonymous();
			func._track = Track.attach('Anonymous.f')
			func.ctx = exeCtx;
			func.extraArg = extraArg;
			func.delegate = this;
			return func;
		};

    $(document).ajaxComplete(function(event, xhr, settings) {
        delete settings.success;
    });
    function forwardAjaxSuccessCallback(data,status,xhr,objCallback){
      return objCallback.fn.apply(objCallback.ctx,[data].concat(objCallback.args));
    }
    function jqAjaxSuccessCallback(callback,args,ctx){
        return forwardAjaxSuccessCallback.transform({fn:callback,ctx:ctx,args:args});
    }
    //add end
    /*
    Dereference any functions from a DOM element.
    */
    function purgeElement(d) {
      //Function body comes from http://javascript.crockford.com/memory/leak.html
      var a = d.attributes, i, l, n;
      if (a) {
          for (i = a.length - 1; i >= 0; i -= 1) {
              n = a[i].name;
              if (typeof d[n] === 'function') {
                  d[n] = null;
              }
          }
      }
      a = d.childNodes;
      if (a) {
          l = a.length;
          for (i = 0; i < l; i += 1) {
              purgeElement(d.childNodes[i]);
          }
      }
    }
		//ease track the reference of HTML forms to locate potential memory leak
		function HTMLFormRef(htmlForm) {
			if ('string' == typeof htmlForm) {
				htmlForm = document.forms[htmlForm];
			}
			this._htmlForm = htmlForm;
		}
		HTMLFormRef.prototype = {
			get : function() {
				return this._htmlForm;
			},
			getId : function() {
				return this._id;
			},
			finalize : function() {
				var form = $(this._htmlForm);
				$(form.prop("elements")).unbind();
				$(_garbageBin).append(form.unbind().remove()[0]).html('');
				form = null;
				delete HTMLFormRef._instances[this._id];
				destroyObject(this);
			}
		};
		HTMLFormRef._id = -1;
		HTMLFormRef._instances = {};
		HTMLFormRef.of = function(htmlForm) {
			if ('string' == typeof htmlForm) {
				htmlForm = document.forms[htmlForm];
			}
			var id = $(htmlForm).prop('_id');
			if (isNaN(id)) {
				id = ++HTMLFormRef._id;
			}
			var instance = HTMLFormRef._instances[id];
			if (undefined == instance) {
				$(htmlForm).prop('_id', id);
				HTMLFormRef._instances[id] = instance = new HTMLFormRef(
						htmlForm);
				instance._id = id;
			}
			return instance;
		};

		//end of utility function declaration

		var _decjConfig = {
		  //modified on 2013-09-08
			//locale : "en_US",
			//modificaiton end
			validationNotify/*extensible*/: function(objField, msg) {
				var fieldName = objField.name,
				eleParent = $(objField).parent(),
				target = ("LABEL" == eleParent.prop("tagName")) ? eleParent : objField,
				objTip = $("#__vn_" + fieldName);
				if (0 == objTip.length) {
					$("<span class='validationTip' id='__vn_"+ fieldName + "'>" + msg + "</span>").insertAfter(target);
				} else {
					objTip.html(msg);
				}
			}
		};

		var REG_EXP_MSG_VAR = /\{(\w+)\}/g,
		REG_EXP_MSG_VAR_BRKT = /[\{|\}]/g;

		var i18n = {
			supportedLocales : [ 'en_US', 'zh_CN' ],/*The first locale is the default locale */
			isLocaleSupported : function(locale) {
				return ($.inArray(locale, i18n.supportedLocales) >= 0);
			},
			getLocale : function(strLocale) {
				var locale = strLocale || _decjConfig.locale;
				locale = i18n.isLocaleSupported(locale) ? locale : i18n.supportedLocales[0];
				return locale;
			},
			_resources : {},
			resources : function() {
				var argc = arguments.length, resources, locale, result;

				if (2 == argc) {//set resources
					resources = arguments[0];
					locale = i18n.getLocale(arguments[1]);
					this._resources[locale] = resources;
				} else if (1 == argc) {//get or set resources
					resources = arguments[0];
					if ('string' == typeof resources) {//get resource
						locale = i18n.getLocale(resources);
						result = this._resources[locale];
						if (!result) {
							result = this._resources[locale] = {};
						}
						return result;
					}
					locale = i18n.getLocale();
					this._resources[locale] = resources;
				}
				locale = locale ? locale : i18n.getLocale();
				result = this._resources[locale];
				if (!result) {
					result = this._resources[locale] = {};
				}

				return result;
			},
			resolveMessage : function(msgKey, params) {
				var res = i18n._resources[i18n.getLocale()] || {},
				msg = res[msgKey];
				if (undefined == msg) {
					return msgKey;
				}
				msg = msg.replace(REG_EXP_MSG_VAR, function(word) {
					word = word.replace(REG_EXP_MSG_VAR_BRKT, "");
					return params[word];
				});
				return msg;
			},
			_fillInElement : function(i, e) {
				var key, msg;

				key = $(e).attr('title');
				if (undefined != key) {
					msg = i18n.resolveMessage(key);
					if (key != msg) {
						$(e).prop('title', i18n.resolveMessage(key));
					}
				}
				key = $(e).html();
				if (undefined != key) {
					msg = i18n.resolveMessage(key);
					if (key != msg) {
            if($(e).hasClass('res-replace')){
              $(e).parent().attr('_msg', key);
              e = $(e).replaceWith(msg);
              $(_garbageBin).append(e[0]).html('');//handle IE orphan node
            }else{
              $(e).html(msg);
            }
						return;
					}
				}

				key = $(e).val();
				if (undefined != key && e.type != "text" && e.type != "checkbox") {
					msg = i18n.resolveMessage(key);
					if (key != msg) {
						$(e).val(msg);
						return;
					}
				}
			},
			populateMsg : function() {
				$("[class*='res'],[class*='res-replace'],select,:input,form").each(i18n._fillInElement);
			},
			/*
			This allows we adjust the URL of CSS files,
			so that we can load locale-aware CSS files.
			 */
			cssURLFilter : function(url,cache) {
				var locale = i18n.getLocale();
				if (0 == url.indexOf('!')) {//Turn off locale-awareness
					url = url.substring(1);
				} else {
					url = url.replace(".css", "-" + locale + ".css");
					url = (_decjConfig.cssBaseURL || '') + url;
				}

        if(false===cache){
          var newURL=new URL(url);
          newURL.params.push('_='+new Date().getTime());
          url=newURL.toString();
        }

				return url;
			}
		};

    String.prototype.val=function(){
      var str=this.toString();
      if(0==str.indexOf('res ')){
        return i18n.resolveMessage($.trim(str.substring(4)),arguments[0] || {});
      }
      if(0==str.indexOf('event ')){
        str=$.trim(str.substring(6));
        var strSelector,
        tmpArr,
        strEvtName;
        tmpArr=str.split('@');
        strSelector=tmpArr[1];
        strEvtName=tmpArr[0];
        return decj.bindEvent(strSelector,strEvtName,arguments[0]);
      }
      if(0==str.indexOf('module ')){
        var moduleId=$.trim(str.substring(7)),
        options=arguments[0];
        return loadModule(moduleId, options);
      }
    };

    function FieldMetaData(cfg) {
			this._cfg = cfg;
		}
		FieldMetaData.prototype = {
			attr : function(fieldName, attr) {
				var fldCfg = this._cfg[fieldName];
				if (undefined == attr) {
					return fldCfg;
				}
				if (undefined == fldCfg) {
					throwErr("FieldMetaData.attr", "No such field "
							+ fieldName + "!");
				}
				var v = fldCfg[attr];
				switch (attr) {
				case 'stereoType':
					v = v || 'String';
					break;
				case 'typeParam':
					v = v || {};
					break;
				case 'alias':
					v = v || fieldName;
					break;
				}
				return v;
			},
			fieldNames : function() {
				var cfg = this._cfg;
				var result = [];
				for ( var attr in cfg) {
					if (cfg.hasOwnProperty(attr)) {
						result.push(attr);
					}
				}
				return result;
			}
		};
    
		var _validators = {
			"Size" : {
				validate : function(value, params) {
					if (!params.min && !params.max) {
						return {
							valid : true
						};
					}
					var min = params['min'] || 0,
					max = params['max'],
					result = {};
					value = $.trim(value);
					if (value.length >= min && value.length <= max) {
						result.valid = true;
					} else {
						result.valid = false;
						result.message = ((min == max) ? "res Size.Exact" : "res Size").val(params);
					}
					return result;
				},
				"validatorBound" : function(objField, params) {
					$(objField).attr("maxlength", params['max']);
				}
			},
			"DecimalMax" : function(value, params) {
				var maxValue = params['value'];
				var result = {};
				if (parseFloat(value) <= maxValue) {
					result.valid = true;
				} else {
					result.valid = false;
					result.message = "res DecimalMax".val(params);
				}
				return result;
			},
			"DecimalMin" : function(value, params) {
				var minValue = params['value'];
				var result = {};
				if (parseFloat(value) >= minValue) {
					result.valid = true;
				} else {
					result.valid = false;
					result.message ="res DecimalMin".val(params);
				}
				return result;
			},
			"NotNull" : function(value, params) {
				var result = {};
				if (null == value) {
					result.valid = false;
					result.message = "res NotNull".val(params);
				}
				var v = $.trim(value);

				if (v.length > 0) {
					result.valid = true;
				} else {
					result.valid = false;
					result.message = "res NotNull".val(params);
				}
				return result;
			},
			"Max" : function(value, params) {
				var maxValue = params['value'] || params['max'];
				var result = {};
				var num;

				num = Number(value).valueOf();
				if (isNaN(num)) {
					result.valid = false;
					result.message = "res Digits".val();
					return result;
				}

				if (num <= maxValue) {
					result.valid = true;
				} else {
					result.valid = false;
					result.message = "res DecimalMax".val({
						value : maxValue
					});
				}
				return result;
			},
			"Min" : function(value, params) {
				var minValue = params['value'] || params['min'];
				var result = {};
				var num;

				num = Number(value).valueOf();
				if (isNaN(num)) {
					result.valid = false;
					result.message = "res Digits".val();
					return result;
				}

				if (num >= minValue) {
					result.valid = true;
				} else {
					result.valid = false;
					result.message ="res DecimalMin".val({
						value : minValue
					});
				}
				return result;
			}
		};

		var _numericFormat = {
			"ae,au,ca,cn,eg,gb,hk,il,in,jp,sk,th,tw,us" : {decimalSep : ".",thousandSep : ","},
			"at,br,de,dk,es,gr,it,nl,pt,tr,vn" : {decimalSep : ",",thousandSep : "."},
			"cz,fi,fr,ru,se,pl" : {decimalSep : ",",thousandSep : " "},
			"ch" : {decimalSep : ".",thousandSep : "'"},
			getCfg : function(locale) {
				var value,rc = locale.substring(locale.indexOf("_") + 1).toLowerCase();
				for ( var key in _numericFormat) {
					if (_numericFormat.hasOwnProperty(key)
							&& (value = _numericFormat[key])
							&& 'function' !== typeof value) {
						if (key.indexOf(rc) >= 0) {
							return value;
						}
					}
				}
			}
		};

		function StereoType(typeName) {
			this._typeName = typeName;
		}

		StereoType.types = {
			"String" : {
				impliedValidation : [ "Size" ],
				parent : null
			},
			"Number" : {
				defaultTypeParam : {
					"integer" : 9,
					"fraction" : 7,
					"rounding" : true
				},
				formatter : function(value, param) {
					var p = $.extend(this.getDefaultTypeParam(),(param || {}));

					var locale = p.locale || i18n.getLocale();
					var decimalSep = _numericFormat.getCfg(locale).decimalSep;
					var thousandSep = _numericFormat.getCfg(locale).thousandSep;
					var decimalCount = p.fraction || 0;
					var rounding = p.rounding;

					var v = String(value);
					var parts = v.split("."); 
					var integralPart = parts[0];
					var decimalPart = parts[1] || "";

					if (rounding) {
						v = Number(integralPart + "." + decimalPart);
						v = v.toFixed(decimalCount);
						parts = v.split(".");
						integralPart = parts[0];
						decimalPart = parts[1];
					} else {
						var tmpDecimalPart = [];
						for ( var i = 0; i < decimalCount; i++) {
							tmpDecimalPart.push(decimalPart.charAt(i)
									|| "0");
						}
						decimalPart = tmpDecimalPart.join("");
					}

					var arr = [];
					var digit;
					var j = 0;
					for ( var i = integralPart.length - 1; i >= 0; i--) {
						digit = integralPart.charAt(i);
						arr.push(digit);
						j++;
						if (j > 0 && (0 == j % 3) && i > 0) {
							arr.push(thousandSep);
						}
					}

					var result = [];
					for ( var i = arr.length - 1; i >= 0; i--) {
						result.push(arr[i]);
					}
					if (undefined != decimalPart && decimalPart.length > 0) {
						result.push(decimalSep);
						result.push(decimalPart);
					}

					v = result.join('');
					return v;
				},
				parser : function(value, param) {
					var p = $.extend(this.getDefaultTypeParam(),(param || {})),
					locale = p.locale || i18n.getLocale(),
					decimalSep = _numericFormat.getCfg(locale).decimalSep,
					thousandSep = _numericFormat.getCfg(locale).thousandSep,
					rounding = p.rounding,
					v = value,
					digit,
					arr = [];
					for ( var len = v.length, i = 0; i < len; i++) {
						digit = v.charAt(i);
						if (digit == thousandSep) {
							continue;
						} else if (digit == decimalSep) {
							digit = ".";
						}
						arr.push(digit);
					}

					v = arr.join('');
					if (isNaN(Number(v))) {
						throwErr('ParseErr', v + ' is not a valid number!');
					}

					return v;
				},
				isValid : function(value, param) {
          var result = true;
          var p = $.extend(this.getDefaultTypeParam(),(param || {}));
          var locale = p.locale || i18n.getLocale();
          var decimalSep = _numericFormat.getCfg(locale).decimalSep;
          var thousandSep = _numericFormat.getCfg(locale).thousandSep;
          value=value || '';
          value=value.replace(new RegExp("\\"+thousandSep,"g"),'');
          var tmpArr=value.split(decimalSep);
          var partsCount=tmpArr.length;
          if(partsCount>=3){
              result = false;
          }else{
              var integralCountLimit = p.integer;
              var decimalCountLimit = p.fraction;
              var integralPart = tmpArr[0];
              var decimalPart = tmpArr[1] || '0';
              tmpArr=String(parseFloat('0.'+decimalPart)).split('.');
              var decimalCount;
              decimalCount=(2==tmpArr.length)? tmpArr[1].length : 0;
              var integralCount=integralPart.length;
              result=(integralCount<=integralCountLimit && decimalCount<=decimalCountLimit);
          }
          return result;
				}
			},
			"Int" : {
				parent : "Number",
				defaultTypeParam : {
					"fraction" : 0,
					"rounding" : false
				},
				impliedValidation : [ "Max", "Min" ]
			},
			"Decimal" : {
				parent : "Number"
			},
			"Boolean" : {},
			"Array" : {
				parent : null
			},
			"Date" : {
				parser : function(value, param) {
					value = String(value);
					value = $.trim(value);
					if (value.length == 0) {
						return value;
					}
					var p = $.extend(this.getDefaultTypeParam(),(param || {})),
					fmt = p.format,
					delimiter = fmt.replace(/[yMd]/g, '').charAt(0),
					fmtParts = fmt.split(delimiter),
					position = {};
					for ( var i = 0; i < 3; i++) {
						if (fmtParts[i].indexOf('y') >= 0) {
							position.y = [ i, fmtParts[i].length ];
						} else if (fmtParts[i].indexOf('M') >= 0) {
							position.m = [ i, fmtParts[i].length ];
						} else if (fmtParts[i].indexOf('d') >= 0) {
							position.d = [ i, fmtParts[i].length ];
						} else {

						}
					}
					var valueParts = value.split(delimiter),
					year, month, day,
					posYear = position.y[0],
					posMonth = position.m[0],
					posDay = position.d[0];
					year = valueParts[posYear];
					if (4 == position.y[1] && year
							&& year.length != position.y[1]) {
						throwErr('ParseErr', 'Invalid date part:' + year
								+ '!');
					}
					month = valueParts[posMonth];
					if (2 == position.m[1] && month
							&& month.length != position.m[1]) {
						throwErr('ParseErr', 'Invalid date part:' + month
								+ '!');
					}
					day = valueParts[posDay];
					if (2 == position.d[1] && day && day.length != position.d[1]) {
						throwErr('ParseErr', 'Invalid date part:' + day
								+ '!');
					}
					var currYear = new Date().getFullYear();
					var date = new Date((2 == position.y[1]) ? parseInt(currYear - (currYear % 1000)) + parseInt(year) : year, month - 1, day);

					var year1 = (2 == position.y[1]) ? date.getFullYear() % 1000 : date.getFullYear();
					var valid = (year == year1
							&& (month == date.getMonth() + 1) && day == date.getDate());
					if (!valid) {
						throwErr('ParseErr', 'Invalid date:' + value + '!');
					}
					var result = fmt.replace(/[y]+/g, year);
					return date;
				},
				formatter : function(value, param) {
					var p = $.extend(this.getDefaultTypeParam(),(param || {}));
					var fmt = p.format;
					var year, month, day;

					var date = value;

					year = (-1 != fmt.indexOf('yyyy')) ? date.getFullYear()
							: (date.getFullYear() % 1000);
					month = date.getMonth() + 1;
					if (-1 != fmt.indexOf('MM')) {
						if (month < 10) {
							month = '0' + month;
						}
					}

					day = date.getDate();
					if (-1 != fmt.indexOf('dd')) {
						if (day < 10) {
							day = '0' + day;
						}
					}

					var result = fmt.replace(/y+/g, year);
					result = result.replace(/M+/g, month);
					result = result.replace(/d+/g, day);
					return result;
				}//end of formatter
			}
		//end of Date
		};

		StereoType.prototype = {
			getImpliedValidation : function() {
				var types = StereoType.types,
				typeName = this._typeName,
				typeCfg = types[typeName],
				rules = [],
				iv;

				while ($.isPlainObject(typeCfg)) {
					iv = typeCfg.impliedValidation;
					if ($.isArray(iv) && iv.length > 0) {
						rules = rules.concat(iv);
					}
					typeCfg = (typeCfg.parent) ? types[typeCfg.parent] : null;
				}
				return rules;
			},
			getRootType : function() {
				var typeName = this._typeName,
				types = StereoType.types,
				typeCfg = types[typeName],
				parentTypeName = typeCfg.parent,
				p = null;

				while (parentTypeName) {
					p = parentTypeName;
					parentTypeName = types[parentTypeName].parent;
				}
				return (null == p) ? typeName : p;
			},
			getConverter : function() {
				var typeName = this._typeName,
				types = StereoType.types,
				typeCfg = types[typeName],
				result = [],
				fmt;

				while ($.isPlainObject(typeCfg)) {
					fmt = typeCfg.formatter;
					if (fmt) {
						result[0] = fmt;
						break;
					}
					typeCfg = (typeCfg.parent) ? types[typeCfg.parent]
							: null;

				}

				typeCfg = types[typeName];
				var parser;
				while ($.isPlainObject(typeCfg)) {
					parser = typeCfg.parser;
					if (parser) {
						result[1] = parser;
						break;
					}
					typeCfg = (typeCfg.parent) ? types[typeCfg.parent] : null;
				}

				return result;
			},
			isValid : function(value, param) {
				var typeName = this._typeName,
				types = StereoType.types,
				rootType = StereoType.of(typeName).getRootType(),
				funcIsValid = types[rootType].isValid,
				result = true;
				if (funcIsValid) {
					result = funcIsValid.apply(this, arguments);
				}
				return result;
			},
			getDefaultTypeParam : function() {
				var typeName = this._typeName,
				types = StereoType.types,
				typeCfg = types[typeName],
				parentTypeName = typeCfg.parent,
				defaultTypeParam = typeCfg.defaultTypeParam || {},
				arrTypeParams = [];
				arrTypeParams.push(defaultTypeParam);

				while (parentTypeName) {
					typeCfg = types[parentTypeName];
					defaultTypeParam = typeCfg.defaultTypeParam || {};
					arrTypeParams.push(defaultTypeParam);
					parentTypeName = typeCfg.parent;
				}

				var result = {};

				while (arrTypeParams.length > 0) {
					$.extend(result, arrTypeParams.pop());
				}
				return result;
			},
			parse : function(value, param) {
				var converter = this.getConverter(),
				parser = converter[1],
				v = value;
				if (parser) {
					v = parser.apply(this, arguments);
				}
				return v;
			},
			format : function(value, param) {
				var converter = this.getConverter(),
				formatter = converter[0],
				v = value;
				if ("string" == typeof v) {
					v = $.trim(v);
					if (v.length == 0) {
						return v;
					}
				}

				if (formatter) {
					v = formatter.apply(this, arguments);
				}
				return v;
			}
		};//end of StereoType.prototype

		StereoType._cache = {};
		StereoType.of = function(typeName) {
			var cpntTypeName = null;//Stereo type of the component of the array.
			if (!typeName) {
				typeName = "String";
			}
			var pos = typeName.indexOf("[]");
			if (pos > 1) {
				cpntTypeName = typeName.substring(0, pos);
				typeName = "Array";
			}
			var cache = StereoType._cache;
			var result = cache[typeName]
					|| (cache[typeName] = new StereoType(typeName));
			result.cpntTypeName = cpntTypeName;
			return result;
		};
		StereoType.register = function(objTypes) {
			$.extend(StereoType.types, objTypes);
		};

		function registerCommonValidators(validtorRegistry) {
			for ( var ruleName in validtorRegistry) {
				_validators[ruleName] = validtorRegistry[ruleName];
			}
		}

		function bindEventHandlers(timerId,module) {
      module=module || timerId;//Older version of Firefox may passin a timer Id as the 1st argument,if the function is called from setTimeout
			var eventBindings = module.events || {},
			eventBinding,
			posOfAtSign,
			evtName,
			selector,
			handler;
			for ( var bindingKey in eventBindings) {
				posOfAtSign = bindingKey.indexOf("@");
				if (-1 == posOfAtSign) {
					continue;
				}
				evtName = bindingKey.substr(0, posOfAtSign);
				selector = bindingKey.substr(posOfAtSign + 1);
				handler = eventBindings[bindingKey];
				if ($.isPlainObject(handler)) {
					handler = handler.h.transform(handler.extra,
							handler.ctx || null);
				}
				_decj.bindEvent(selector, evtName, handler);
			}

		}

		var _loadedModules = {};
		/*
		Form is a wrapper over HTMLForm,
		it implements HTMLForm validation,formatting,automatic filling and submission in the format of JSON    
		 */
		function Form(htmlFormRef) {
			this._htmlFormRef = htmlFormRef;

		}
		Form._id = -1;
		Form._instances = {};
		Form.of = function(htmlForm) {
			var htmlFormRef = HTMLFormRef.of(htmlForm);
			var id = htmlFormRef.getId();
			var instance = Form._instances[id];
			if (undefined == instance) {
				Form._instances[id] = instance = new Form(htmlFormRef);
				instance._id = id;
			}
			return instance;
		}
		/*
		Validate the specified field.

		 */
		Form.validateField = function(field, rules, typeParam,validatorRegistry) {
			debug('Form.validateField');
			var rule, validator, result, params, ruleSetting,
			fieldName = field.name,
			fv = $(field).val(),
			stereoType = $(field).attr("_stereoType"),
			isValid = StereoType.of(stereoType).isValid(fv, typeParam);

			if (isValid) {
				try {
					fv = StereoType.of(stereoType).parse(fv, typeParam);
				} catch (err) {
					if ("ParseErr" == err.name) {
						isValid = false;
					}
				}
			}

			if (!isValid) {
				result = {
					valid : false,
					message : "res NotValidType".val({
						typeName : stereoType
					}),value:fv
				};
				return result;
			}

			if ($.isEmptyObject(rules)) {
				return {
					valid : true,value:fv
				};
			}
			var ruleSetting;
			for ( var ruleName in rules) {
				if (!rules.hasOwnProperty(ruleName)) {
					continue;
				}
				ruleSetting = rules[ruleName];
				/*
				 * A validator can be defined as a function
				 * or an object with a method named as validate.
				 * Here we normalized the two.
				 * 
				 */
				if ($.isFunction(ruleSetting)) {
					params = {
						fieldName : fieldName,
						field : field
					};
					validator = {
						validate : ruleSetting
					};
				} else {
					params = ruleSetting || {};
					validator = _validators[ruleName] || validatorRegistry[ruleName];
					if ($.isFunction(validator)) {
						validator = {
							validate : validator
						};
					}
					params.fieldName = fieldName;
				}

				if (undefined == validator) {
					throwErr('Form.validateField','Cannot find a validator for rule ' + rulename);
				}

				result = validator.validate.apply(validator.ctx || null, [fv, params ]);
        result.value=fv;
				if (!result.valid) {
					if (_debug) {
						debug("Validation rule " + ruleName
								+ " NOT passed for field " + field.name);
					}
					break;
				}
			}//end of for

			return result;
		};
		Form.prototype = {
			_validateAndFormatField : function(field) {
				var metaDataRegistry = this._metaData.validation,
				alias = $(field).attr("_alias") || field.name,
				fieldMetaData = metaDataRegistry[alias],
				rules = metaDataRegistry[alias].validation,
				moduleValidatorRegistry = this._metaData.validators,
				stereoType = fieldMetaData.stereoType,
				typeParam = fieldMetaData.typeParam,
				result = Form.validateField(field, rules, typeParam,moduleValidatorRegistry);

				if (result.valid) {
					var fv = $(field).val(),//field value
          rv=result.value;//raw value
					//save the raw value for the field to the _value attribute
					if ("Date" == StereoType.of(stereoType).getRootType()) {
						$(field).attr("_value", rv.getTime());
					} else {
						$(field).attr("_value", rv);
					}

					fv = StereoType.of(stereoType).format(rv, typeParam);
					if (!$.isArray(fv)) {
						field.value = fv;
					}
					_decjConfig.validationNotify(field, "");
				} else {
					_decjConfig.validationNotify(field, result.message);
					$(this).removeAttr("_value");
				}
        return this;
			},
			_blurEvtHandler : function(evt) {
				Form.of(this.form)._validateAndFormatField(this).trackChanges(evt.target);
			},
			/*
			For each validation rule, there is a corresponding validator
			that does the actual validation.
			And, a valdiation rule can specify an event listener that
			subscribes to an event called validatorBound,which is triggered
			after the rule's associated validator is bound to an blur event of an HTMLForm elememt.
			The listener can be used to do something like setting the maxlength attribute of an HTMLForm element.
			 */
			//_triggerValidatorBoundEvt : function(objField, rules) {
       _triggerValidatorBoundEvt : function(objField) {
				var rule,
				evtListener,
				objValidator,
				ruleSetting,
				metaData = this._metaData,
				validatorRegistry = metaData.validators,
				rules = metaData.validation[$(objField).attr('_alias') || objField.name].validation;
				for ( var ruleName in rules) {
					ruleSetting = rules[ruleName];
					if ($.isPlainObject(ruleSetting)) {
						objValidator = _validators[ruleName] || validatorRegistry[ruleName];
						evtListener = objValidator.validatorBound;
						if ($.isFunction(evtListener)) {
							setTimeout(evtListener.transform([ objField,ruleSetting ]), 50);
						}
					}
				}
			},
			_bindBOValidatorAndFormatter : function() {
				var metaData = this._metaData;
				metaData.track = Track.attach('Form._metaData');
				var bo = metaData.bo, boName = bo.name, 
				boAlias = bo.alias || boName, 
				fieldsMetaData = bo.fieldsMetaData, 
				rules, stereoType, impliedRulenames, 
				impliedRules, typeParam, formFieldName, 
				refField, metaDataRegistry = {}, formFields = [], formDescriptor;
				formDescriptor = this._metaData.formDescriptor;
				$.each(fieldsMetaData,function(fieldName, fieldMetaData) {
              metaDataRegistry[fieldName] = fieldMetaData;
              rules = fieldMetaData.validation || {};
              formFieldName = fieldMetaData.alias || fieldName;
              /*
              Stereotype implies some validation rules
              here we merge  rules declared
              by a module into these rules.
               */
              stereoType = fieldMetaData.stereoType;
              impliedRulenames = StereoType.of(stereoType).getImpliedValidation();
              impliedRules = {};
              typeParam = fieldMetaData.typeParam;
              for ( var i = impliedRulenames.length - 1; i >= 0; i--) {
                impliedRules[impliedRulenames[i]] = typeParam;
              }

              //merge rules defined by a module and implied rules for a stereo type
              $.extend(impliedRules, rules);
              rules = impliedRules;

              $.extend(rules,(formDescriptor.validation || {})[fieldName]);
              metaDataRegistry[fieldName].validation = rules;

              refField = $("[name=" + formFieldName+ "]", "form[name=" + boAlias+ "]");

              if (fieldName != formFieldName) {
                refField.attr("_alias", fieldName);
              }
              refField.attr("_stereoType", stereoType);

              if (refField.length >= 1) {
                formFields.push(refField[0]);
              }

				});//end of $.each

				//process forms fields that will be ignored when populating and packaging form.
				var otherValidations = formDescriptor.validation || {};
				for ( var key in otherValidations) {//TODO:optimize
					var value = otherValidations[key];
					var st = value.stereoType || 'String';
					var tp = value.typeParam || {};
					delete value['stereoType'];
					delete value['typeParam'];
					var field = $("[name=" + key + "]", "form[name="+ boAlias + "]");

					if (metaDataRegistry[key]) {
						$.extend(metaDataRegistry[key].validation, value);
              delete metaDataRegistry[key].validation['typeParam'];
              if(undefined==metaDataRegistry[key].typeParam){
                  metaDataRegistry[key].typeParam={};
              }
              $.extend(metaDataRegistry[key].typeParam,tp);
					} else {
						metaDataRegistry[key] = {
							stereoType : st,
							typeParam : tp,
							validation : value
						};
						formFields.push(field[0]);
					}

					field.attr("_stereoType", st);
				}
				var self = this;
				this._metaData.validation = metaDataRegistry;

				$(formFields).bind('blur', this._blurEvtHandler).each(
						function(i, e) {
							self._triggerValidatorBoundEvt(e);
						});
				self = formFields = null;
			},
			/* 
			Bind validators and formatters for the form.

			metaData should conform to below object structure:
			bo:{
			   name:'bo name',
			   type:'bo type name',
			   alias:'corresponding form name',
			   fieldsMetaData:{
			   
			   }
			},
			validators:{
			   
			   
			},
			formDescriptor:{
			
			}
			 */
			_interceptFormSubmit : function(evt) {
				var form = this,
				formSelector = "form[name=" + form.name + "]",
				objSubmit = $(formSelector + " :submit");
				objSubmit.toggleClass('submitting').prop('disabled', true);
				var objImage = $(formSelector + " [type=image]");
				objImage.attr('_src', objImage.attr('src'));
				objImage.attr('src', objImage.attr('_loading')).prop('disabled', true);
				var result;
				try {
					result = Form.of(form).submit();
				} catch (e) {
					result = false;
					Form.of(form)._enableSubmitBtn();
					if ('validateForm' == e.name) {
						debug('Form data invalid!');
					} else {
						evt.preventDefault();
						throw e;
					}
				}
				return result;
			},
			_interceptFormReset : function(evt) {
				var result,
				prompt = ("res "+($(this).attr('_prompt') || 'form.reset.prompt')).val(),
				answer = confirm(prompt);
				if (!answer) {
					evt.preventDefault();
					return false;
				}
				var form = Form.of(this.form),
				backingData = form._metaData.backingData;
				if (backingData) {
					evt.preventDefault();
					form.fillWithJSON(backingData, true);
					return false;
				}
				return true;
			},
			init : function(metaData) {
				this._metaData = metaData;
				this._bindBOValidatorAndFormatter();

				var objForm = this._htmlFormRef.get(),
				formSelector = "form[name=" + objForm.name + "]";
				/*
				$(":submit",$(objForm))==>this way cause memory leak
				 */
				if (1 == $(formSelector + " :submit").length) {
					//listen to the form submit event to support automatic submission
					$(objForm).bind('submit', this,this._interceptFormSubmit);
				}
				//listen to the click event of a reset button to support enhanced form resetting
				$(formSelector + " :reset").bind('click',this._interceptFormReset);

				var fldsMetaData = new FieldMetaData(metaData.bo.fieldsMetaData);

				//Attach stereoType and alias to each field of the form
				$.each(fldsMetaData.fieldNames(), function(i, fn) {
					var fldAlias = fldsMetaData.attr(fn, 'alias'),
          st=fldsMetaData.attr(fn, 'stereoType');
          
					$(objForm[fldAlias]).attr("_alias", fn).attr("_stereoType",st);

          if(st.indexOf('[]')>0){
            $(objForm[fldAlias]).attr("_ordered", fldsMetaData.attr(fn,'typeParam').ordered || 'false');
          }
				});
				objForm = null;
				return this;
			},
			/*
			Validate the whole html form.
			 */
			validate : function() {
				var metaData = this._metaData,
				validatorRegistry = metaData.validators,
				eleForm = this._htmlFormRef.get(),
				valid = true,
				rules,
        typeParam,
        fieldAlias,
        validationMetaData,
				formName;

				if ('String' == typeof eleForm) {
					eleForm = document.forms[eleForm];
				}
				formName = eleForm.name;
				validationMetaData = metaData.validation;

				$.each($(eleForm).prop("elements"),function() {
              if (!this.name) {
                return;
              }
              fieldAlias = $(this).attr("_alias") || this.name;
              rules = validationMetaData[fieldAlias];
              if (!rules) {
                return;
              }
              rules = rules.validation;
              typeParam = validationMetaData[fieldAlias].typeParam || {};
              if ($.isPlainObject(rules)) {
                valid = valid && Form.validateField(this,rules, typeParam,validatorRegistry).valid;
                $(this).blur();
                if (!valid) {
                  return true;
                }
              }
					});
				eleForm = null;
				return valid;
			},
			_enableSubmitBtn : function() {
				var form = this._htmlFormRef.get(),
				formSelector = "form[name=" + form.name + "]";
				$(formSelector + " :submit").toggleClass('submitting').prop('disabled', false);
				var objImage = $(formSelector + " [type=image]");
				objImage.attr('src',objImage.attr('_src') + '#' + new Date().getTime()).prop('disabled', false);
			},
			_formSubmitCallback : function() {
				var form = this._htmlFormRef.get();
				var formCfg = this._metaData.formDescriptor;
				if ('success' != arguments[1] && !formCfg.fail) {
					alert(
          'res form.sumbit-failed.prompt'.val(
							{
								formDesc : (form.title || form.name),
								error : arguments[2]
							}));
				}
				//Enable the submit button/image and restore its css class                        
				this._enableSubmitBtn();
				(formCfg.always || dummy).apply(null, arguments);
			},
			submit : function() {
				var form = this._htmlFormRef.get(),
				encodingType = $(form).prop('_enctype') || $(form).prop('enctype');

				if ('multipart/form-data' == encodingType) {//file upload not supportted 
					return true;
				}
				var isFormValid = Form.of(form).validate();
				if (isFormValid) {
					var formCfg = this._metaData.formDescriptor;
					var filter = formCfg.filter;
					var url = $(form).prop('action');

					var formData = Form.of(form).collectData();
					if (null == formData) {
						throwErr('decj.Form.submit',
								'multipart/form-data not supported.');
					}
					var reqData = formData[0];
					var contentType = formData[1];
					if (reqData instanceof Array) {
						reqData = $.param(reqData);
					} else {
						reqData = JSON.stringify(reqData);
					}

					loadModule(formCfg.processor, {
						resident : formCfg.resident || true,
						httpRequest : {
							url : url,
							method : formCfg.method || $(form).attr('method') || 'POST',
							contentType : contentType,
							reqData : reqData,
							global : false,
							success : formCfg.submitSuccess,
							error : formCfg.fail,
							always : this._formSubmitCallback.transform(null, this),
							timeout : formCfg.timeout,
							_track : Track.attach('ajax')
						}
					});

				} else {
					throwErr("validateForm","Failed to pass validation,form:"+ $(form).attr('name'));
				}
				return false;
			},
			_invokeDataFilter : function(packFormData) {
				var metaData = this._metaData,
				filter = metaData.formDescriptor.filter;
				if (filter) {
					/*
					By passing in the backing data of the form,it means it is possible to submit only
					changed data to the server.
					 */
					filter(this._htmlFormRef.get(), packFormData,metaData.backingData);
				}
			},
			dataAsJSON : function() {
				var result = {},
				field,
				fn,//field name
				fv,//field value
				fldTypeName,
				metaData = this._metaData,
				fldMetaData;
        
				fldMetaData = new FieldMetaData(metaData.bo.fieldsMetaData);
				for ( var form = this._htmlFormRef.get(), elements = form.elements, i = elements.length - 1; i >= 0; i--) {
					field = elements[i];
					if (!field.name || field.disabled) { //skip disabled fields
						continue;
					}

					fn = $(field).attr("_alias") || field.name;

					// there is no model for this field, skip it
					if (undefined == fldMetaData.attr(fn)) {
						continue;
					}

					fldTypeName = fldMetaData.attr(fn, 'stereoType');
					fldTypeName = StereoType.of(fldTypeName).getRootType();
					fv = $(field).attr("_value") || field.value;

					if ('Array' == fldTypeName) {
						fldTypeName = StereoType.of(fldMetaData.attr(fn,'stereoType')).cpntTypeName;
						if (!$.isArray(result[fn])) {
							result[fn] = [];
						}
						if (field.checked) {//handle checkbox
							fv = window[fldTypeName](fv).valueOf();//convert the string field value to 'correct' data type
							result[fn].push(fv);
						}
						//handle multi-selectbox
						for ( var option, options = (field.options || []), j = options.length - 1; j >= 0; j--) {
							option = options[j];
							if (option.selected) {
								fv = window[fldTypeName](option.value).valueOf();
								result[fn].push(fv);
							}
						}
					} else {
						if ("Date" == fldTypeName) {
							fv = Number(fv).valueOf();
						} else {
							fv = window[fldTypeName](fv).valueOf();
						}
						if ('radio' == field.type) {
							if (field.checked) {
								result[fn] = fv;
							}
						} else {
							result[fn] = fv;
						}
					}
				}

				this._invokeDataFilter(result);
				return result;
			},
			/*
			Collect form data as an array of name/value pair
			 */
			dataAsNVPair : function() {
				var result = [],
				fldMetaData,
				metaData = this._metaData;
				fldMetaData = new FieldMetaData(metaData.bo.fieldsMetaData),
				form = this._htmlFormRef.get();
				$.each($(form).serializeArray(), function(i, e) {
					var fn = $(form[e.name]).attr("_alias") || e.name;
					// there is no model for this field, skip it
					if (undefined == fldMetaData.attr(fn)) {
						return;
					}
					e.value = StereoType.of(fldMetaData.attr(fn, 'stereoType')).parse(e.value, fldMetaData.attr(fn, 'typeParam'));
					if (e.value instanceof Date) {
						e.value = e.value.getTime();
					}
					e.name = fn;
					result.push(e);
				});

				this._invokeDataFilter(result);
				form = null;
				return result;
			},
			/*
			Collect form data eighter as an JSON object
			or as an array of name/value pair.
			HTML form with enctype set to multipart/form-data is not supported.
			@return An array. The 1st element is contentType, the 2nd form data.
			 */
			collectData : function() {
				var form = this._htmlFormRef.get(),
				encodingType = $(form).attr('_enctype') || $(form).attr('enctype'),
				formData, contentType,
				formDescriptor = this._metaData.formDescriptor;

				if (undefined == encodingType) {
					encodingType = formDescriptor.encodingType || "application/json";
				}
				if (-1 != encodingType.indexOf('multi-part')) {
					return null;
				}

				if (encodingType.toLowerCase().indexOf('json') >= 0) {
					formData = Form.of(form).dataAsJSON();
					contentType = "application/json; charset=UTF-8";
				} else {
					formData = Form.of(form).dataAsNVPair();
					contentType = "application/x-www-form-urlencoded; charset=UTF-8";
				}
				return [ formData, contentType ];
			},
			/*
			Fill in the form with specified JSON data.
			 */
			fillWithJSON : function(jsonData,/*optional*/triggerBlur) {
				var field, fn, /*field name*/
        fv,//field value
				fldTypeName, tagName,
				rv,//raw field 
				typeParam,
				formFldName,
				form = this._htmlFormRef.get(),
				fldMetaData = new FieldMetaData(this._metaData.bo.fieldsMetaData),
				fieldNames = fldMetaData.fieldNames();
				for ( var i = fieldNames.length - 1; i >= 0; i--) {
					fn = fieldNames[i];
					formFldName = fldMetaData.attr(fn, 'alias') || fn;

					fldTypeName = fldMetaData.attr(fn, 'stereoType');
					typeParam = fldMetaData.attr(fn, 'typeParam');

					var type = StereoType.of(fldTypeName);

					fv = jsonData[fn];
					field = $(form[formFldName]);
					if (0 == field.length) {//No corresponding form field, skip it
						continue;
					}
					field = field[0];
					tagName = field.tagName.toUpperCase();
					if ($.isArray(fv)) {//handle checkbox and selectbox element populating
						if (tagName == "SELECT") {//The corresponding form elemenent is a selectbox
							for ( var option, j = field.options.length - 1; j >= 0; j--) {
								option = field.options[j];
								if ($.inArray(option.value, fv) >= 0) {
									$(option).prop('selected', true);
								}
							}
						} else {//The corresponding form elemenent is a checkbox
							$(form[formFldName]).each(function(i, e) {
								if ($.inArray(e.value, fv) >= 0) {
									$(e).prop("checked", true);
								}
							});
						}

					} else {
						if (field.type == "radio") {
							$(form[formFldName]).each(function(i, e) {
								if (e.value == fv) {
									$(e).prop("checked", true);
								}
							});
						} else {
							rv = fv;
							if (StereoType.of(fldTypeName).getRootType() == "Date") {
                if(fv && (fv=$.trim(fv)).length>0){
                  fv = new Date(Number(fv)); 
                }
							}
							if (undefined != fv) {
								$(field).attr("_value", rv);
								fv = type.format(fv, typeParam);
								$(field).val(fv);
								$(field).attr("value", fv);
							}
						}
					}
					if (triggerBlur) {
						$(field).blur();
					}
				}
				form = null;
				this._metaData.backingData = jsonData;
        return this;
			},
      trackChanges:function(target){
        var form = this._htmlFormRef.get(),
        backingData=this._metaData.backingData || {},
        fieldName=$(target).attr('_alias') || target.name;
       
        if(!$.isEmptyObject(backingData)){
          var originalVal=backingData[fieldName],
          notChanged;
          if($.isArray(originalVal)){
            //handle list:ordered & non-ordered
            notChanged=isSameArr($(target).val(),originalVal,('true'==$(target).attr('_ordered')));
          }else{
            notChanged=(originalVal==$(target).attr('_value'));
          }
          //console.log(originalVal,$(target).attr('_value'));
          if(notChanged){
           $(target).removeClass('valueChanged');
          }else{
            $(target).addClass('valueChanged');
          }
        }
      },
			finalize : function() {
				delete Form._instances[this._id];
				destroyObject(this, true);
			}
		};

		function invokeModuleInit(objModule) {
			try {
				(objModule.init || dummy).apply(objModule);
			} catch (e) {
				e.message = "Error raised by init of module ["+ objModule.id + "]:\n\r" + e.message;
				throw e;
			}
		}

		function loadModule(moduleId, options) {
			var argc = arguments.length;
			if (0 == argc) {
				return;
			}
			if ('string' == typeof moduleId) {
				options = options || {};
			} else if ($.isPlainObject(moduleId)) {
				options = moduleId;
				moduleId = undefined;
			}
			var isResident = options.resident || false;
			if (!isResident) {
				var viewTarget = options.viewTarget || 'wkspc';
				options.viewTarget = viewTarget;
				var prevLoadedModule = _loadedModules[viewTarget];
				//if (prevLoadedModule) {
        if (prevLoadedModule && !options.viewRender) {
					decj.unloadModule(viewTarget);
				}
			}
			if (moduleId) {
				options.moduleId = moduleId;
				require([ moduleId ], activateModule.transform(options));
			} else {
				if ($.isPlainObject(options)) {
					activateModule(options);
				}
			}
		}

    function parseModuleDef(data, status, xhr, options) {
      $.Deferred(function(deferred){
        var objModule = {};
        objModule.data = data;

        var js = xhr.getResponseHeader('X-JS');
        if (js) {
          objModule.js = js;
          objModule.id=js;
        }

        var screen = xhr.getResponseHeader('X-Screen');
        if (screen) {
          objModule.screen = screen;
        }

        var css = xhr.getResponseHeader('X-CSS');
        if (css) {
          objModule.css = css.split(';');
        }

        var resources = xhr.getResponseHeader('X-Resources');
        if (resources) {
          objModule.resources = resources.split(';');
        }

        var metaDataURL = xhr.getResponseHeader('X-MetaData-URL');
        if (metaDataURL) {
          objModule.metaDataURL = metaDataURL;
        }
        require([js],deferred.resolve.transform(objModule,deferred));//Notify the deferred object that it is time to complete
      }).done(function(objModule){
        var objModule1={};
        $.extend(objModule1, objModule);
        var newOptions = {};
        $.extend(newOptions, options);
        delete newOptions['httpRequest'];
        newOptions.data = data;       
        activateModule(objModule1, newOptions);
        data=status=xhr=options=null;
      });
			
		}

		function PageStuffLoader(options) {
			this.track = Track.attach('PageStuffLoader');
			this._options = options;
		}
    PageStuffLoader.prototype = {
			defaultViewRender : function(code, target) {
				var $viewTarget = $('#' + target),
				$parent = $viewTarget.parent();
				$viewTarget.detach();
				$viewTarget.html(code);
				$parent.append($viewTarget);
			},
			loadScreen : function(screen) {//Load screen file
        debug("Loading screen:"+screen);
        var task=$.Deferred();
        task.done(this.screenLoaded.transform(task,this));
				if (!screen) {
          task.resolve(null);
					return task;
				}

        if(false==this._options.cache){
          //screen = screen + "?r=" + new Date().getTime();
          var newURL=new URL(screen);
          newURL.params.push('_='+new Date().getTime());
          screen=newURL.toString();
        }
				$.get(screen,task.resolve.transform(undefined,task));  
        return task;
			},
			screenLoaded : function(html) {//To be invoked after screen file being loaded
        debug("Screen loaded");
        if(null==html){
            return;
        }
				var options = this._options;
				viewTarget = options.viewTarget,
				viewRender = options.viewRender || this.defaultViewRender;/* extensible */
        if(viewRender!=this.defaultViewRender){
            $('#' + viewTarget).css("display", "none");
        }
				viewRender(html, viewTarget);
			},
			loadCSS : function(css, moduleId) {//load css files
        debug("Loading css:"+css);
        var task=$.Deferred(),
				urls =normalizeArray(css),
        cache=this._options.cache;
        task.done(this.cssLoaded.transform(undefined,this));
				for ( var i = urls.length - 1; i >= 0; i--) {
					urls[i] = i18n.cssURLFilter(urls[i],cache); 
				}
				var cssLoader = CSS({
					url : urls,
					ownerModule : moduleId,
          /*
					success : task.resolve.transform(undefined,task),
					fail : function(urls, loadTime) {

					},
          */
					always : function() {
            task.resolve();
						if (cssLoader) {
							cssLoader.finalize();
						}
						task=urls=cssLoader = null;
					},
          crossDomainCSSLoadClue:function(url){
            var clue=this.crossDomainCSSLoadClue(url);
            clue=clue.replace('-'+i18n.getLocale(),'');
            return clue;
          }
				}).load();
       
        return task;
			},
			cssLoaded : function(urls, loadTime) {//To be invoked after css files being loaded
         debug("CSS loaded:");
			},
			loadRes : function(objModule) {//Load resource files
        debug("Loading resources");
        var task=$.Deferred(),
        res = [],
        locale = i18n.getLocale(),
        resources=normalizeArray(objModule.resources);
        task.done(this.resourcesLoaded.transform(undefined,this));
        for ( var i = resources.length - 1; i >= 0; i--) {
          res.push(resources[i] + '-' + locale);
        }
        require(res,task.resolve.transform(objModule,task));//Notify the Deferred that it is time to complete
        return task;
			},
			resourcesLoaded : function() {//To be invoked after resource files being loaded
        debug("Resources loaded");
        var localeRes = i18n.resources(),
				objModule = arguments[arguments.length - 1];
				objModule.loadedResources = [];
				for ( var i = arguments.length - 2/*exclude the last argument,which is objModule */; i >= 0; i--) {
					objModule.loadedResources.push(arguments[i]);
					$.extend(localeRes, arguments[i]);//merge all loaded resources into i18n._resources
				}
			},
      paintUI:function(objModule){
        debug("Painting UI");
        var uiPaintTask=$.Deferred(),
        scrnLoadTask=this.loadScreen(objModule.screen);
        $.when(
          scrnLoadTask,//task for loading HTML
          this.loadRes(objModule)//task for loading Resources
        ).done(function(){
          debug("UI painted");
          i18n.populateMsg();
          uiPaintTask.resolve();
          objModule=uiPaintTask=null;
        });     
        return uiPaintTask;
      },
      showUI:function(objModule,options){
        var uiShowTask=$.Deferred(),
        uiPaintTask=this.paintUI(objModule);
        $.when(
          uiPaintTask,
          this.loadCSS(objModule.css, objModule.id)//task for loading CSS
          ).done(function(){
            var viewTarget = options.viewTarget;
            $('#'+viewTarget).css('display','block');
            uiShowTask.resolve();
            objModule=uiShowTask=null;
          });
          return [uiShowTask,uiPaintTask];   
      },
      loadModuleData : function(objModule, options) {
        debug("Loading module data");
        var task=$.Deferred(),
				httpReq = options.httpRequest,
        self=this;
        task.done(this.moduleDataLoaded.transform(task,this));
				if (httpReq) {
					$.ajax(httpReq.url, {
						type : httpReq.method,
						contentType : httpReq.contentType,
						data : httpReq.reqData,
						global : (dummy === httpReq.cbFail),
						success : jqAjaxSuccessCallback(task.resolve,[objModule, options],task),
						error : httpReq.fail,
						timeout : httpReq.timeout,
						_track : Track.attach('ajax')
					});
				} else {
					var data = objModule.data = options.data || {};
          task.resolveWith(self,[data,objModule,options]);
				}
        return task;
			},
			moduleDataLoaded : function(data,objModule,options) {
        debug("Module data loaded");
				if (objModule) {
					objModule.data = data;
				}
        var httpReq = options.httpRequest;
        if(httpReq && httpReq.success){
          httpReq.success(data,objModule,options);
        }
			},
      loadModuleMetaData : function(objModule) {
        debug("Loading module metadata");
        var task=$.Deferred(),
        self = this;
        task.done(this.moduleMetaDataLoaded.transform(undefined,this));
				if (objModule.metaDataURL) {
					$.getJSON(objModule.metaDataURL,jqAjaxSuccessCallback(task.resolve,objModule,task))
          .fail(ajaxFailed.transform('ajax.getModuleMetaData'));
				} else {
					task.resolveWith(self,[{},objModule]);
				}
        return task;
			},
			moduleMetaDataLoaded : function(data,objModule) {
        debug("Module metadata loaded");
				if (objModule) {
					objModule.metaData = data;
				}
			},
			initModule : function(a1,a2,a3,objModule, options) {//initilize the loaded module
        debug("init module");
				var moduleId = objModule.id;
				_loadedModules[options.viewTarget || moduleId] = objModule;
				var viewTarget = options.viewTarget || 'wkspc';
				$('#' + viewTarget).css("display", "block");
				(objModule.preInit || dummy).apply(objModule);
				setTimeout(bindEventHandlers.transform(objModule), 0);//perform this task asynchronously
				objModule.metaData = objModule.metaData || {};
				var boList = objModule.metaData.bo;
				var boProp;
				for ( var boName in boList) {
					if (!boList.hasOwnProperty(boName)) {
						continue;
					}
					boProp = boList[boName];
					var formName = boProp.alias || boName,
					metaData = {
						bo : {
							name : boName,
							type : boProp.type,
							alias : formName,
							fieldsMetaData : objModule.metaData.boMetaData[boProp.type]
						//changed
						},
						validators : objModule.validators || {},
						formDescriptor : (objModule.forms || {})[formName] || {}
					};
					//Populate forms automatically
					if (objModule.data) {
						Form.of(formName).init(metaData).fillWithJSON(objModule.data[boName] || {});//TODO:optimize code
					}
				}
				invokeModuleInit(objModule);
				if (options.httpRequest) {
					(options.httpRequest.always || dummy)(objModule);
				}
				objModule = null;
				this.finalize();
        debug("module inited");
			},
			finalize : function() {
				destroyObject(this, true);
			}
		};
    function activateModule(objModule, options) {
			var argc = arguments.length;
			if (2 == argc) {
			  //modified on 2013-09-08
				//var locale = _decj.App.locale || options.locale
				//		|| (window.navigator.userLanguage || window.navigator.language);
				var locale =options.locale || _decj.App.locale || (window.navigator.userLanguage || window.navigator.language);
				//modificaiton end
				_decj.setLocale(locale);//set and normalize the locale
				objModule.track = Track.attach('objModule');
        objModule.resources=normalizeArray(objModule.resources);
        objModule.resources.push('decjres');
				var loader = new PageStuffLoader(options);
				objModule.id = (objModule.id || options.moduleId || objModule.js);
        var uiShowTsk=loader.showUI(objModule,options);//Load, paint and decorate UI
        $.when(
          uiShowTsk[1],//task for painting screen
          loader.loadModuleData(objModule, options),//task for loading module data
          loader.loadModuleMetaData(objModule)//task for loading module metadata
          ).done(loader.initModule.transform([objModule, options],loader));
				
			} else if (1 == argc) {
				var options = objModule;
				var httpReq = options.httpRequest;
				if (httpReq) {
					$.ajax(httpReq.url,{
								type : httpReq.method,
								contentType : httpReq.contentType,
								data : httpReq.reqData,
								global : (dummy === httpReq.fail),
								success : httpReq.success || parseModuleDef.transform(options),
								error : httpReq.fail,
								timeout : httpReq.timeout,
								_track : Track.attach('ajax')
							}).always(httpReq.always || dummy);
				}
			}
		}

		function _destroyObject(obj, key, value, recursive) {
			if (recursive) {
				if (value && 'function' == typeof value.finalize) {
					value.finalize();
				} else if ($.isArray(value)) {
					for ( var j = value.length - 1; j > -0; j--) {
						if ('function' == typeof value[j].finalize) {
							value[j].finalize();
						}
					}
				}
			}
			delete obj[key];
		}
		function destroyObject(obj, recursive) {
			if (obj == window) {
				return;
			}
			$.each(obj, function(key, value) {
				_destroyObject(obj, key, value, recursive);
			});
			obj = null;
		}

		var _garbageBin = null;
		var REG_EXP_LOCALE_DELIMITER = /[^a-z]/i;
		_decj = {
			version : '0.1.0',/*jquery:1.8,requirejs:2.1.5*/
			App : _decjConfig,
			setLocale : function(locale) {
				var arr = locale.split(REG_EXP_LOCALE_DELIMITER);
				arr[0] = arr[0].toLowerCase();
				if (arr.length == 2) {
					arr[1] = arr[1].toUpperCase();
				}
				locale = arr.join('_');
				locale = i18n.getLocale(locale);
				_decjConfig.locale = locale;
				return locale;
			},
			startup : function(objConfig) {
        $.Deferred(function(deferred){
          objConfig = objConfig || EMPTY_OBJ;
          $.extend(_decjConfig, objConfig);
          registerCommonValidators(objConfig.validators || {});
          StereoType.register(objConfig.types || {});
          var app = _decjConfig;

          (app.preInit || dummy).apply(app, [ $, _decj ]);
          require(app.requires || [ 'jquery', 'decj' ], deferred.resolve.transform(app,deferred));
        }).done(function() {
					var args = arguments;
					$(function() {
						_garbageBin = document.createElement('DIV');
						_garbageBin.style.display = 'none';
						$(document.body).append(_garbageBin);

            var app=args[args.length-1];
            var initModuleDef=normalizeArray(app.initialModule);
						if (initModuleDef) {
							_decj.loadModule.apply(_decj, initModuleDef);
						}
						(app.init || dummy).apply(null, args);
            objConfig=null;
					});
				});
			},
			loadModule : loadModule,
			unloadModule : function(viewTarget) {
				debug("Unload module:" + viewTarget);
				var objModule = _loadedModules[viewTarget];
				if (!objModule) {
					debug("Cannot find module:" + viewTarget);
					return;
				}
				var moduleId = objModule.id;
				//Unbind all event listeners previously bound by this module
				var posOfAtSign;
				for ( var bindingKey in objModule.events) {
					if (-1 == (posOfAtSign = bindingKey.indexOf("@"))) {
						continue;
					}
					$(bindingKey.substr(posOfAtSign + 1)).unbind();
				}

				var boList = objModule.metaData.bo;
				var form;
				for ( var boName in boList) {
					if (!boList.hasOwnProperty(boName)) {
						continue;
					}
					form = document.forms[boList[boName].alias || boName];
					Form.of(form).finalize();
					form = null;
				}

				//unload loaded resources
				var resLoaded = objModule.loadedResources || [];
				var allRes = i18n.resources();
				for ( var res, i = resLoaded.length - 1; i >= 0; i--) {
					res = resLoaded[i];
					for ( var msgKey in res) {
						if (allRes.hasOwnProperty(msgKey)) {
							delete allRes[msgKey];
						}
					}

				}
				resLoaded = null;
				delete _loadedModules[viewTarget];

				//clean up link tags for this module
				$("link[_ownerModule='" + moduleId + "']").remove();
				$("style[_ownerModule='" + moduleId + "']").remove();

				var locale = i18n.getLocale();
				var allJS = (objModule.requiredJS || []).concat((objModule.resources || []));

        if(objModule.id){
          allJS.push(objModule.id);
        }
				var e;
				for ( var i = allJS.length - 1; i >= 0; i--) {
					e = allJS[i];
					if (e == "decj" || e == "cssloader") {
						continue;
					}
					if (0 == e.indexOf("res/")) {
						e += "-" + locale;
					}
					requirejs.undef(e);
					$("script[data-requiremodule='" + e + "']").remove();
				}

				//Invoke the module's finalize method
				if (objModule.finalize) {
					try {
						objModule.finalize();
					} catch (e) {
						throwErr("finalize module:" + moduleId, e.message);
					} finally {
						destroyObject(objModule);
						objModule = null;
						if ('function' == typeof CollectGarbage) {
							setTimeout(CollectGarbage, 500);
						}
					}
				}
				var $target=$('#' + viewTarget);
				//Allowing detaching event handlers attached  with other means than $.bind
				purgeElement($target[0]);
				//$('#' + viewTarget).html('');
				$target.html('');
			},
			bindEvent : function(strSelector, strEvtName, funcHandler) {
				$(strSelector).bind(strEvtName, funcHandler);
			},
			registerCommonValidators : registerCommonValidators,
			validateForm : function(eleForm) {
				return Form.of(eleForm).validate();
			},
			formDataAsJson : function(form) {
				return Form.of(form).dataAsJSON();
			},
			regType : StereoType.register,
			submitForm : function(form) {
				return Form.of(form).submit();
			},
      StereoType:StereoType
		};

		window.decj = _decj;
    _decj.startup(decjApp.config);
		return _decj;
});
