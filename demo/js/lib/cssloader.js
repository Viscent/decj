/*!
 * decj Framework---eases your daily web frontend dev with declarative prograrmming
 * https://code.google.com/p/decj
 *
 * Copyright(C) 2013 Viscent Huang (viscent.huang@gmail.com)
 *
 */
define(["jquery"], function($){
function debug(msg){
		if(window.console){
			console.log(msg);
		}else{
			$("#message").val($("#message").val()+"\n\r"+msg);
		}
}
	
function CSSLoader(cfg){
	this.cfg=cfg;
	this._pendings=[];
	$.extend(this._pendings,cfg.url);//copy the urls
	this._loadState={};// Track the loading states of each css file
	this._timerId={};//Save the ID returned by a setTimeout call
}

CSSLoader.LOADING=0;
CSSLoader.DONE=1; 
CSSLoader.FAILED=2;
var EMPTY_OBJ={},
EMPTY_ARR=[],
DUMMY=function(){};

 CSSLoader.prototype={
    _externalURLs:[],
    _cssLoadClue:{},
    _cssAjaxLoaded:function(data,textStatus,jqXHR,url,ownerModule){
       this._loadState[url]= CSSLoader.DONE;
       var ndTxt=document.createTextNode(data);
       var ndStyle=document.createElement('STYLE');
       ndStyle.setAttribute('_ownerModule',ownerModule);
       ndStyle.appendChild(ndTxt);
       $('head').append(ndStyle);
    },
    _cssAjaxFailed:function(){
       var url=arguments[arguments.length-1];
       this._loadState[url]=CSSLoader.FAILED;
    },
    crossDomainCSSLoadClue:function(url){
      var fileName=url.substring(url.lastIndexOf('/')+1);
      fileName=fileName.substr(0,fileName.indexOf('.css'));
      return fileName+"-Clue";
    },
 	_loadCSS:function(urls){
        if(0==urls.length){
            return;
        }

        var url=urls.pop();
        if(isCrossDomain(url)){
            var lnk=document.createElement("link");
            lnk.rel="stylesheet";
            //Record the time at which the loading begins
            lnk.setAttribute("_loadTime",String(new Date().getTime()));
            lnk.setAttribute("_ownerModule",this.cfg.ownerModule);
            $("head")[0].appendChild(lnk);
            this._loadState[url]= CSSLoader.LOADING;
            lnk.href=url;
            var cssLoadClue;
            if(url.indexOf("#")>1){
              cssLoadClue=url.substring(url.indexOf("#")+1)+"-Clue";
            }else{
              cssLoadClue=(this.cfg.crossDomainCSSLoadClue || this.crossDomainCSSLoadClue).apply(this,[url]);
            }
            $("<span id='"+cssLoadClue+"' width='0px' height='0px'></span>").appendTo(document.body);
            this._cssLoadClue[url]=cssLoadClue;
            this._externalURLs.push(url);
        }else{
            //CSS files in the same domain will be loaded by AJAX
            $.get(url).done(this._cssAjaxLoaded.transform([url,this.cfg.ownerModule],this)).fail(this._cssAjaxFailed.transform(url,this));
        }
	 },
	 _detectSingle:function(url){
        if($.inArray(url,this._externalURLs)<0){
            return;
        }

        var loadState=this._loadState,
        cssLoadClue=this._cssLoadClue[url];

        if("none"==$('#'+cssLoadClue).css('display')){
            loadState[url]=CSSLoader.DONE;
            $('#'+cssLoadClue).remove();
        }
 
	 },
    _doDetect:function(){
     var cfg=this.cfg,
		 now=new Date().getTime(),
		 pendings=this._pendings,
		 nextPendings=[],
		 loadState=this._loadState,
		 urls=cfg.url;
		 //timed out,stop polling the loading state and mark 
		 // any file not done loading as failed
		 if(parseInt((now-this._loadTime)/1000)>=cfg.timeOut){
      clearInterval(this._timerId);
		 	var failedURLs=[];
			 for(var i=urls.length-1,url;i>=0;i--){
			 	url=urls[i];
				 if(loadState[url]!= CSSLoader.DONE){
				 	loadState[url]= CSSLoader.FAILED;
					 failedURLs.push(url) ;
				 } 
			 }
			 
			 if(failedURLs.length>0){
			 	cfg.fail(failedURLs,this._loadTime);
			 }else{
			 	cfg.success(cfg.url,this._loadTime);
			 }
			 cfg.always(cfg.url,this._loadTime);
			 return;
		 }
		 
		 var len=pendings.length;
		 for(var i=0,url;i<len;i++){
		 	url=pendings[i];
			 this._detectSingle(url);
			 if(loadState[url]!= CSSLoader.DONE){
			 	nextPendings.push(url);
			 } 
		 }
		 this._pendings=nextPendings;
		 
		 if(0==len){
      clearInterval(this._timerId);
			var allStates= CSSLoader.DONE;
			var urlCount=cfg.url.length;
			for(var i=urlCount-1,url;i>=0;i--) {
				url=cfg.url[i];
				allStates*=loadState[url];
			}
			
			if(allStates==CSSLoader.DONE){
				cfg.success(cfg.url,this._loadTime);
			}else{
				 var failedURLs=[];
				 for(var i=urlCount-1,url;i>=0;i--) {
					url=cfg.url[i];
					 if(loadState[url]!= CSSLoader.DONE){
						failedURLs.push(url);
					} 
				} 
				 cfg.fail(failedURLs,this._loadTime); 
			}
			 cfg.always(cfg.url,this._loadTime);
			 return; 
		 }
    },_detect:function(){
        var self=this;
        self._timerId=setInterval(function(){
            self._doDetect();
        },self.cfg.pollingInterval)
	 },
	 load:function(){
	 	var cfg=this.cfg;
		 this._loadTime=new Date().getTime();
		 
		 if(cfg.url.length==0){
		   cfg.success([],this._loadTime);
		   cfg.always([],this._loadTime);
		    return this;
		 }
		 if(cfg.cache){
		   var newUrls=[];
		   $.each(cfg.url,function(i,e){
		     if($("link[href='"+e+"']").length==0){
		       newUrls.push(e);
		     }
		   });
		   if(newUrls.length==0){
		     cfg.success([],this._loadTime);
		     cfg.always([],this._loadTime);
		    return this; 
		   }else{
		     cfg.url=newUrls;
		   }
		 }
		 
		 var ctx=this;
		 var urls=[];
		 $.extend(urls,cfg.url);//copy the urls
		 var func=function(){
		 	ctx._loadCSS(urls);
		 }
		 
		 for(var url,i=urls.length-1;i>=0;i--){
            url=urls[i];
		 	setTimeout(func,0);//load the css files asynchorously
		 }
		 ctx._detect();
      return this;
	 },
     finalize:function(){
        var cfg=this.cfg;
        delete cfg.fail;
        delete cfg.success;
        delete cfg.always;
        cfg=this.cfg=null;
        delete this._loadState;
     }
     
};//end of prototype definition

function CSS(cfg){
    var urls;
	if("string"==typeof cfg.url){
	  cfg.url=[cfg.url];
	}
	urls=cfg.url;
	cfg.success=cfg.success || DUMMY;
	cfg.fail=cfg.fail|| DUMMY;
	cfg.always=cfg.always || DUMMY;
	cfg.timeOut=cfg.timeOut || 3;//s
	cfg.pollingInterval=cfg.pollingInterval || 20; //ms
	cfg.ownerModule=cfg.ownerModule || '_';

	if("boolean"!=typeof cfg.cache){
	  cfg.cache=true;
	}
	
	if(false===cfg.cache){
	  var ts=new Date().getTime();
	  
	  for(var i=urls.length-1,url;i>=0;i--){
	     url=urls[i];
	     urls[i]=addParam(url,"_="+ts);
	  }
	}
	return new CSSLoader(cfg);
}

var REG_EXP_HOST=/\/\/([^\/]+)/;
function isCrossDomain(url){
    var host=location.host;
    var matches=(url || '').match(REG_EXP_HOST);
    var result=false;

    if(matches && matches[1]!=host){
        result=true;
    }
    return result;
}

function addParam(url,param,anchor){
  if(null==url || undefined==url){
    return url;
  }
  
 var parts=url.split("#");
  var url=parts[0];
  var anchorPart=(1==parts.length) ? "" : "#"+parts[1];
  parts=url.split("?");
  parts[1]=(1==parts.length) ? "?"+param : "?"+parts[1]+"&"+param;
  if(anchor && anchor.length>0){
    anchorPart+=(""==anchorPart) ? "#"+anchor : "&"+anchor;
  }
  return parts.join("")+anchorPart;
}
  return CSS;
});
