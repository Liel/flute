import { Component, OnInit } from '@angular/core';
import { AudioChannel } from 'src/app/models/audio-channel.model';
import { AudioChannelsService } from 'src/app/services/audio-channels.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  audioContext : AudioContext = undefined;
  gumStream: any;
  rec : any;
  input: any;
  isMono: boolean = true;
  isRecording = false;
  channels : AudioChannel[] =[];
  currentRecordingDuration: number;
  longestDuration: number = 0;
  interval: any;

  constructor(private audioChannelsService : AudioChannelsService) { }

  ngOnInit(): void {
    // this.audioContext = new AudioContext();
  }

  public recordBtnClicked() {
    this.isRecording ?
      this.stopRecording() :
      this.startRecording();
  }

  public playAll() {
    this.audioChannelsService.playAll();
  }

  public removeChannel(channel : AudioChannel) {
    var idx = this.channels.indexOf(channel);
    this.channels.splice(idx);
  }

  private startRecording() : void {
    this.startTimer();
    this.playAll();
    this.isRecording = true;

    /*
      Simple constraints object, for more advanced audio features see
      https://addpipe.com/blog/audio-constraints-getusermedia/
    */

      var constraints = { audio: true, video:false }

    navigator.mediaDevices.getUserMedia(constraints).then(this.createStream.bind(this)).catch(function(err) {
      console.log(err);
        //enable the record button if getUserMedia() fails
        // recordButton.disabled = false;
        // stopButton.disabled = true;
        // pauseButton.disabled = true
    });
  }

  private createStream(stream) {
    console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

    this.gumStream = stream;

    /* use the stream */
    this.audioContext = this.audioContext || new AudioContext();
    this.input = this.audioContext.createMediaStreamSource(stream);

    /*
      Create the Recorder object and configure to record mono sound (1 channel)
      Recording 2 channels  will double the file size
    */
    var Recorder = window["Recorder"];
    this.rec = new Recorder(this.input,{numChannels:this.isMono?1:2})

    //start the recording process
    this.rec.record()

    console.log("Recording started");

  }

  private stopRecording() {
    this.stopTimer();
    this.isRecording = false;

    //tell the recorder to stop the recording
    this.rec.stop();

    //stop microphone access
    this.gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    this.rec.exportWAV(this.createDownloadLink.bind(this));
  }

  private createDownloadLink(blob) {

    var url = URL.createObjectURL(blob);

    //name of .wav file to use during upload and download (without extendion)
    var filename = new Date().toISOString();

    // var au = document.createElement('audio');
    // var li = document.createElement('li');
    // var link = document.createElement('a');
    // //add controls to the <audio> element
    // au.controls = true;
    // au.src = url;
    // //link the a element to the blob
    // link.href = url;
    // link.download = new Date().toISOString() + '.wav';
    // link.innerHTML = link.download;
    // //add the new audio and a elements to the li element
    // li.appendChild(au);
    // li.appendChild(link);
    // document.body.appendChild(au);

    //add the li element to the ol
    //recordingsList.appendChild(li);
    this.channels.push({
      url:url,
      duration: String(this.currentRecordingDuration),
      name: filename
    } as AudioChannel);
    this.audioChannelsService.sources = this.channels.map(x => x.url);
    this.calcLongestDuration();
  }

  private calcLongestDuration() {
    if(this.currentRecordingDuration > this.longestDuration)
      this.longestDuration = this.currentRecordingDuration;
  }

  private startTimer() : void {
    this.currentRecordingDuration = 0;
    this.interval = setInterval(() =>{
      this.currentRecordingDuration++;
    }, 1000);
  }

  private stopTimer() : void {
    clearInterval(this.interval);
  }

}
