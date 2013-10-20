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
		var _decj, _debug = true, EMPTY_OBJ = {}, EMPTY_ARR = [], dummy = function() {};

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
    //0726
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
			var ms = d.getMillisec