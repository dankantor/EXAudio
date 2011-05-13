package {
  
  import flash.display.Sprite;
  import flash.events.*;
  import flash.external.ExternalInterface;
  import flash.media.Sound;
  import flash.media.SoundChannel;
  import flash.media.SoundLoaderContext;
  import flash.media.SoundTransform;
  import flash.net.URLRequest;
  import flash.system.Security;
  import flash.utils.Timer;
  
  public class EXAudio extends Sprite {
    
    private var sound:Sound;
    private var sChannel:SoundChannel;
    private var sTransform:SoundTransform;
    private var callback:String = "EXAudioSwfCallback";
    private var sPosition:Number = 0;
    private var isStopped:Boolean = true;
    private var positionTimer:Timer;
    private var fullyLoaded:Boolean = false;
    private var volume:Number = 1;
    private var debugOn:Boolean = false;
    private var soundLoaderContext:SoundLoaderContext;
    
    public function EXAudio() {
      Security.allowDomain('*');
      soundLoaderContext = new SoundLoaderContext(100, false);
      this.setupExternalInterface();
      var flashVars:Object = root.loaderInfo.parameters;
      callback = flashVars.callback;
      var src:String = flashVars.src;
      if (src != "" && src != null){
        this.load(src);
      }
      var vol:String = flashVars.volume;
      if (vol != "" && vol != null){
        this.volume = cleanVolume(Number(vol));
      }
      var debugString:String = flashVars.debug;
      if (debugString == "true"){
        this.debugOn = true;
      }
      ExternalInterface.call(callback, {"type" : "swfLoaded"});
    }
    
    private function setupExternalInterface():void{
      try {
        ExternalInterface.addCallback('playSong', play);
        ExternalInterface.addCallback('pauseSong', pause);
        ExternalInterface.addCallback('loadSong', load);
        ExternalInterface.addCallback('setVolume', setVolume);
        ExternalInterface.addCallback('currentTime', currentTime);
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function load(src:String):void{
      try {
        this.stop();
        this.fullyLoaded = false;
        var request:URLRequest = new URLRequest(src);
        sound = new Sound();
        this.addListeners();
        sound.load(request, soundLoaderContext);
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function addListeners():void{
      try {
        positionTimer = new Timer(250);
        positionTimer.addEventListener(TimerEvent.TIMER, positionHandler);
        sound.addEventListener(Event.OPEN, openHandler);
        sound.addEventListener(IOErrorEvent.IO_ERROR, loadErrorHandler);
        sound.addEventListener(Event.COMPLETE, completeHandler);
        sound.addEventListener(ProgressEvent.PROGRESS, progressHandler);
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function removeListeners():void{
      try {
        positionTimer.stop();
        positionTimer.removeEventListener(TimerEvent.TIMER, positionHandler);
        sChannel.removeEventListener(Event.SOUND_COMPLETE, endedHandler);
        sound.removeEventListener(Event.OPEN, openHandler);
        sound.removeEventListener(IOErrorEvent.IO_ERROR, loadErrorHandler);
        sound.removeEventListener(Event.COMPLETE, completeHandler);
        sound.removeEventListener(ProgressEvent.PROGRESS, progressHandler);
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function play():void{
      try {
        if (this.isStopped == true){
          positionTimer.start();
          sChannel = sound.play(sPosition);
          this.transformSound();
          this.isStopped = false;
          ExternalInterface.call(callback, {"type" : "play"});
        }
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function transformSound():void{
      try {
        sChannel.removeEventListener(Event.SOUND_COMPLETE, endedHandler);
        sChannel.addEventListener(Event.SOUND_COMPLETE, endedHandler);
        sTransform = sChannel.soundTransform;
        sTransform.volume = this.volume;
        sChannel.soundTransform = sTransform;
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function pause():void{
      try {
        this.sPosition = sChannel.position;
        sChannel.stop();
        this.isStopped = true;
        ExternalInterface.call(callback, {"type" : "pause"});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function stop():void{
      try {
        sChannel.stop();
        this.sPosition = 0;
        this.removeListeners();
        this.isStopped = true;
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function cleanVolume(v:Number):Number{
      if (v < 0){
        v = 0;
      }
      if (v > 1){
        v = 1;
      }
      return v;
    }
    
    private function setVolume(v:Number):void{
      this.volume = cleanVolume(v);
      try {
        this.transformSound();
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function currentTime(s:Number):void{
      try {
        this.sPosition = s;
        sChannel.stop();
        sChannel = sound.play(sPosition);
        this.transformSound();
        this.isStopped = false;
        ExternalInterface.call(callback, {"type" : "seeked"});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function endedHandler(event:Event):void{
      try {
        this.stop();
        ExternalInterface.call(callback, {"type" : "ended"});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function openHandler(event:Event):void{
      try {
        ExternalInterface.call(callback, {"type" : "loadstart"});
        ExternalInterface.call(callback, {"type" : "canplay"});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function loadErrorHandler(event:Event):void{
      try {
        ExternalInterface.call(callback, {"type" : "error"});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function completeHandler(event:Event):void{
      try {
        this.fullyLoaded = true;
        ExternalInterface.call(callback, {"type" : "loadedmetadata"});
        ExternalInterface.call(callback, {"type" : "canplaythrough"});
        ExternalInterface.call(callback, {"type" : "durationchange", "duration" : sound.length});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function progressHandler(event:ProgressEvent):void {
      try {
        ExternalInterface.call(callback, {"type" : "progress", "loaded" : event.bytesLoaded, "total" : event.bytesTotal, "lengthComputable" : this.fullyLoaded});
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function positionHandler(t:TimerEvent):void{
      try {
        if (this.isStopped == false){
          ExternalInterface.call(callback, {"type" : "timeupdate", "currentTime" : sChannel.position, "duration" : sound.length});
        }
      } catch(e:Error){
        this.debug(e);
      }
    }
    
    private function debug(e:Error):void{
      try {
        if (this.debugOn == true){
          ExternalInterface.call(callback, {"type" : "debug", "error" : e});
          trace(e);
        }
      } catch(e:Error){
        trace(e);
      }
    }
    
  }
}