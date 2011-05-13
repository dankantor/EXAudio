/*
name: ex-audio.js
copyright: exfm (Extension Entertainment Inc.) 2011
contact: exaudio@ex.fm
*/
if (typeof(EXAudio) == 'undefined'){
	EXAudio = function(srcString){
		

/*
*
************************** BROWSER DETECTION ************************************
*
*/

this.canUseAudio = false;
this.usingFlash = true;
		
(function (t) {
	var userAgent = navigator.userAgent;
	if (userAgent.toLowerCase().indexOf('chrome') != -1){
		t.canUseAudio = true;
		t.usingFlash = false;
	}
	if (userAgent.toLowerCase().indexOf('safari') != -1){
		t.canUseAudio = true;
		t.usingFlash = false;
	}
	if (userAgent.toLowerCase().indexOf('msie 9.0') != -1){
		t.canUseAudio = true;
		t.usingFlash = false;
	}
	if (userAgent.toLowerCase().indexOf('android') != -1){
		t.canUseAudio = false;
		t.usingFlash = true;
	}
	try {
    	if (EXAudioForceFlash == true){
            t.canUseAudio = false;
    		t.usingFlash = true;
    	}
    } catch(e){}
    try {
    	if (EXAudioForceHTML == true){
            t.canUseAudio = true;
    		t.usingFlash = false;
    	}
    } catch(e){}
})(this);


/*
*
********************************************* START FLASH AUDIO OBJECT ***********************************************
*
*/


FlashAudio = function(srcString){


/*
*
************************** PUBLIC MEMBERS ************************************
*
*/


this.currentTime = 0;
this.duration = NaN;
this.paused = true;
this.played = {
	"TimeRanges" : []
};
this.src = "";
if (srcString != "" && srcString != undefined && srcString != null){
	this.src = srcString;
}
this.ended = false;
this.volume = 1;
this.muted = false;

/*
*
************************** PUBLIC METHODS ************************************
*
*/	


this.load = function(){
	if (this.src != ""){
		exAudioFlashAudioObject.ended = false;
		getSWF("exAudioFlash").loadSong(this.src);
	};
};

this.play = function(){
	getSWF("exAudioFlash").playSong();
};

this.pause = function(){
	getSWF("exAudioFlash").pauseSong();
};

this.addEventListener = function(eventName, callback, b){
	for (var i in listeners){
		if (eventName == i){
			listeners[i].push(callback);
			break;
		};
	};
};

this.removeEventListener = function(type, fn){
	if (typeof listeners[type] != 'undefined') {
		for (var i = 0, l; l = listeners[type][i]; i++) {
	    	if (l == fn) break;
	    }
	listeners[type].splice(i, 1);
	}
};



/*
*
************************** PRIVATE MEMBERS ************************************
*
*/



addWatchToObject(this, "currentTime", function(id, oldval, newValue){
	if (flashSetTime == false){
		getSWF("exAudioFlash").currentTime(newValue*1000);
	}
	flashSetTime = false;
	return newValue;
});
addWatchToObject(this, "volume", function(id, oldValue, newValue){
	getSWF("exAudioFlash").setVolume(newValue);
	return newValue;
});


flashSetTime = false;


/*
*
************************** JS / FLASH COMMUNICATION ************************************
*
*/

swfLoaded = false;

getSWF = function(n) {
	var isIE = navigator.appName.indexOf("Microsoft") != -1;
    return (isIE) ? window[n] : document[n];
};

EXAudioFlashCallback = function(event){
	switch (event.type){
		case "swfLoaded" :
			swfLoaded = true;
			dispatchEvent("ready");
		break;
		case "play" :
			exAudioFlashAudioObject.paused = false;
			dispatchEvent(event.type);
		break;
		case "pause" :
			exAudioFlashAudioObject.paused = true;
			dispatchEvent(event.type);
		break;
		case "ended" :
			exAudioFlashAudioObject.ended = true;
			dispatchEvent(event.type);
		break;
		case "timeupdate" :
			flashSetTime = true;
			exAudioFlashAudioObject.currentTime = event.currentTime/1000;
			exAudioFlashAudioObject.duration = event.duration/1000;
			dispatchEvent("timeupdate", exAudioFlashAudioObject);
		break;
		case "durationchange" :
			exAudioFlashAudioObject.duration = event.duration/1000;
			dispatchEvent("durationchange");
		break;
		case "loadstart" :
			dispatchEvent(event.type);
		break;
		case "canplay" :
			dispatchEvent(event.type);
		break;
		case "canplaythrough" :
			dispatchEvent(event.type);
		break;
		case "error" :
			dispatchEvent(event.type);
		break;
		case "loadedmetadata" :
			dispatchEvent(event.type);
		break;
		case "progress" :
			dispatchEvent(event.type, event);
		break;
		case "seeked" :
			dispatchEvent(event.type);
		break;
		case "debug" :
			if (typeof(EXAudioSwfDebug) != 'undefined'){
				if (EXAudioSwfDebug == true){
					console.log(event);	
				}
			}
		break;
		default : 
		break;
	}
}


/*
*
************************** EVENTS ************************************
*
*/

listeners = {
	'play' : [],
	'pause' : [],
	'timeupdate' : [],
	'durationchange' : [],
	'ready' : [],
	'ended' : [],
	'loadstart' : [],
	'canplay' : [],
	'canplaythrough' : [],
	'error' : [],
	'loadedmetadata' : [],
	'progress' : [],
	'seeked' : []
};

dispatchEvent = function(type, object){
	if (typeof listeners[type] != 'undefined' && listeners[type].length) {
		var array = listeners[type].slice();
    	for (var i = 0, l; l = array[i]; i++) {
    		//l(object);
    		l.call(object);
   		 }
    	return true;           
	}
    return false;
};


/*
*
************************** EMBED SWF ************************************
*
*/

(function (t) {
	var debug = false;
	if (typeof(EXAudioSwfDebug) != 'undefined'){
		if (EXAudioSwfDebug == true){
			debug = true;
		}
	}
	if (typeof(EXAudioSwfUrl) != 'undefined'){
		var div = document.createElement('div');
		var swfUrl = EXAudioSwfUrl+"?"+new Date().getTime();
		div.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1" id="exAudioFlash" type="application/x-shockwave-flash"><param name=movie value="'+swfUrl+'"><param name=swLiveConnect value="true"><param name=allowScriptAccess value="always"><param name=allowNetworking value="all"><param name=wMode value="transparent"><param name=flashVars value="&callback=EXAudioFlashCallback&src='+t.src+'&volume='+t.volume+'&debug='+debug+'"><embed flashVars="callback=EXAudioFlashCallback&src='+t.src+'&volume='+t.volume+'&debug='+debug+'" src="'+swfUrl+'" type="application/x-shockwave-flash" width="1" height="1" allowNetworking="all" allowScriptAccess="always" wMode="transparent" name="exAudioFlash"></embed></object>';
		document.body.appendChild(div);
	} else {
		console.log('EXAudio Error: EXAudioSwfUrl cannot be undefined');
	}
})(this);



/*
*
****************************************** END FLASH AUDIO OBJECT ********************************************************
*
*/

};


/*
*
************************** RETURN ************************************
*
*/
var newAudioElement;
dispatchReady = function(){
	var event = document.createEvent('Event');
	event.initEvent("ready", true, true);
	newAudioElement.dispatchEvent(event);
};

if (this.canUseAudio == true){
	newAudioElement = document.createElement('audio');
	if (srcString != "" && srcString != undefined && srcString != null){
		newAudioElement.src = srcString;
	}
	document.body.appendChild(newAudioElement);
	setTimeout(dispatchReady, 10);
	return newAudioElement;
} else {
	var exAudioFlashAudioObject = new FlashAudio(srcString);
	return exAudioFlashAudioObject;
}


	
/*
*
************************** END ************************************
*
*/	
	};
};


/*
*
************************** UTILS ************************************
*
*/

/*
* object.watch v0.0.1: Cross-browser object.watch
*
* By Elijah Grey, http://eligrey.com
*
* A shim that partially implements object.watch and object.unwatch
* in browsers that have accessor support.
*
* Public Domain.
* NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/
function ieObjectWatcherInterval(t){
	for (i in ieObjectWatcher){
		if (i != 'watch' && i != 'unwatch') {
			if (ieObjectWatcher[i].obj[i] != ieObjectWatcher[i].oldval){
				ieObjectWatcher[i].handler.call(this, ieObjectWatcher[i], ieObjectWatcher[i].oldval, ieObjectWatcher[i].obj[i]);
			}
			ieObjectWatcher[i].oldval = ieObjectWatcher[i].obj[i];
		}
	}
}
ieObjectWatcherIntervalId = null;
ieObjectWatcher = {};


function addWatchToObject(object, prop, handler){
	if (!Object.prototype.watch) {
		try {
	        var oldval = object[prop], newval = oldval,
	        getter = function () {
	            return newval;
	        },
	        setter = function (val) {
	            oldval = newval;
	            return newval = handler.call(object, prop, oldval, val);
	        };
	        if (delete object[prop]) { // can't watch constants
	            if (Object.defineProperty) // ECMAScript 5
	                Object.defineProperty(object, prop, {
	                    get: getter,
	                    set: setter
	                });
	            else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
	                Object.prototype.__defineGetter__.call(object, prop, getter);
	                Object.prototype.__defineSetter__.call(object, prop, setter);
	            } 
	        }
		} catch(e){
			try {
				object[prop] = oldval;
				if (prop != undefined){
					ieObjectWatcher[prop] = {};
					ieObjectWatcher[prop]['oldval'] = oldval;
					ieObjectWatcher[prop]['obj'] = object;
					ieObjectWatcher[prop]['handler'] = handler;
					clearInterval(ieObjectWatcherIntervalId);
					ieObjectWatcherIntervalId = setInterval(ieObjectWatcherInterval, 200, object);
				}
			} catch(e){}
			
		}
	} else {
		object.watch(prop, handler);
	}
}