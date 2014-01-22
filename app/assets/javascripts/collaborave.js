window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();
context.position = 0;
context.position_diff = 0;
context.duration = 0;




window.Collaborave = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    Collaborave.getPosition = function (element){
      var el = $(element);
      var position = [el.offset().left, el.offset().top];
      return position;
    };
    Collaborave.router = new Collaborave.Routers.Router({$rootEl: $("#content")});
		Backbone.history.start();

    //create master audio elements
		Collaborave.masterTrack = context.createGain();
		Collaborave.masterTrack.gain.value = 1;
		Collaborave.mainMeter = context.createAnalyser();
		Collaborave.mainMeter.smoothingTimeConstant = 0.5;
		Collaborave.mainMeter.fftSize = 32;
		Collaborave.mainMeter2 = context.createAnalyser();
		Collaborave.mainMeter.smoothingTimeConstant = 0.5;
		Collaborave.mainMeter.fftSize = 32;  
		Collaborave.analyzer = context.createAnalyser();
		Collaborave.analyzer.smoothingTimeConstant = 0.5;
		Collaborave.analyzer.fftsize = 32;  
		Collaborave.mainSplitter = context.createChannelSplitter();  

		//create master connections  
		Collaborave.mainMeterNode = context.createScriptProcessor(2048, 1, 1);  
		Collaborave.mainMeterNode.connect(context.destination);
		Collaborave.masterTrack.connect(Collaborave.mainSplitter);
		Collaborave.mainSplitter.connect(Collaborave.mainMeter,0,0);
		Collaborave.mainSplitter.connect(Collaborave.mainMeter2,1,0);
		Collaborave.masterTrack.connect(Collaborave.analyzer);
		Collaborave.analyzer.connect(context.destination);
		Collaborave.mainMeter.connect(Collaborave.mainMeterNode);
		Collaborave.masterTrack.connect(context.destination);

    //recorder

    var WORKER_PATH = '/assets/recorderWorker.js';

    Collaborave.Recorder.toggleRecording = function () {
      if (Collaborave.Recorder.recording) {
          // stop recording
          audioRecorder.stop();
          Collaborave.Recorder.recording = false;
          audioRecorder.getBuffers(function () { audioRecorder.exportWAV(Collaborave.Recorder.doneEncoding) });
      } else {
          // start recording
          if (!audioRecorder)
              return;
          Collaborave.Recorder.recording = true;
          audioRecorder.clear();

          audioRecorder.record();

      }
    }
    Collaborave.Recorder.recIndex = 0;
    Collaborave.Recorder.doneEncoding = function ( blob ) {
      Recorder.forceDownload( blob, "myRecording" + ((Collaborave.Recorder.recIndex<10)?"0":"") + Collaborave.Recorder.recIndex + ".wav" );
      Collaborave.Recorder.recIndex++;
    }

    var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;

      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
      

    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
      Collaborave.Recorder.startTime = context.position;

    }

    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffers = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffers' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    this.exportMonoWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportMonoWAV',
        type: type
      });
    }

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  Recorder.forceDownload = function(blob, filename){
    var params = new FormData();
    Collaborave.testBlob = blob;
    params.append('file_name', filename);
    params.append('data', blob);
    params.append('track_id', Collaborave.Recorder.trackId);
    params.append('start_time', Collaborave.Recorder.startTime);
 
    $.ajax({
        type: 'POST',
        url: '/regions',
        data: params,
        processData: false,
        contentType: false
    }).done(function(data) {
      Collaborave.currentProject.fetch({
        success: function () {
          Collaborave.currentProject.load();
        }
      });
    });

  }

  window.Recorder = Recorder;
  }
};

Collaborave.Recorder = {};

Collaborave.updateTimer = function (){

  //set max time
  if ((context.duration < context.position) && (!Collaborave.Recorder.trackId)) {
    context.position = context.duration;
    Collaborave.currentProject.pause();
    document.getElementById("timer").innerHTML = timerString(context.position);  
  }

  //set minimum time
  if (context.position < 0) {
    context.position = 0;
    Collaborave.currentProject.pause();
    document.getElementById("timer").innerHTML = timerString(context.position); 
  } 

  //update timer (made acurate thanks to the web audio API's currentTimer)
  if (context.playing === true) {
    context.position += (context.currentTime - context.position_diff);      
  }
  if (context.position != 0) document.getElementById("timer").innerHTML = timerString(context.position); 
  context.position_diff = context.currentTime;
  // drawSlider(); 

  //draw time slider
  // function drawSlider(){
  //   ctxt.clearRect(0, 0, 10, 1000);
  //       ctxt.fillStyle='#ccc';
  //       ctxt.fillRect(0,0,duration,6);
  //       ctxt.fillStyle='#999';
  //       ctxt.fillRect(0,0,timeoffset,6);
  // }

  //make string for timer (use floor/rounding and pad with zeros)
  function timerString(time){
    minutes = Math.floor(time/60);
    seconds = Math.floor(time - (minutes*60));
    centiseconds = time - Math.floor(time);
    string = zeroPad(minutes,2) + ":" + zeroPad(seconds,2) + '.' + zeroPad(Math.floor(centiseconds*100),2);
    return string;  
  }  

  //zero padding function
  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }
}



Collaborave.Recorder.initAudio = function () {
  if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
  if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

  function gotStream(stream) {
    Collaborave.Recorder.inputPoint = context.createGain();

    // Create an AudioNode from the stream.
    Collaborave.Recorder.realAudioInput = context.createMediaStreamSource(stream);
    Collaborave.Recorder.realAudioInput.connect(Collaborave.Recorder.inputPoint);

    //    audioInput = convertToMono( input );

    Collaborave.Recorder.analyserNode = context.createAnalyser();
    Collaborave.Recorder.analyserNode.fftSize = 2048;
    Collaborave.Recorder.inputPoint.connect( Collaborave.Recorder.analyserNode );

    audioRecorder = new Recorder( Collaborave.Recorder.inputPoint );

    Collaborave.Recorder.monitorGain = context.createGain();
    Collaborave.Recorder.monitorGain.gain.value = 0;
    Collaborave.Recorder.inputPoint.connect( Collaborave.Recorder.monitorGain );
    Collaborave.Recorder.monitorGain.connect( Collaborave.masterTrack );
    
}

    navigator.getUserMedia({audio:true}, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}


