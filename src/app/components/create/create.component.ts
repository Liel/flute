import { Component, OnInit } from '@angular/core';
import { AudioChannel } from 'src/app/models/audio-channel.model';
import { AudioChannelsService } from 'src/app/services/audio-channels.service';
import { CounterService } from 'src/app/services/counter.service';
import { MetronomeService } from 'src/app/services/metronome.service';

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
  isPlaying = false;
  channels : AudioChannel[] =[];
  currentRecordingDuration: number;
  longestDuration: number = 0;
  interval: any;

  constructor(private audioChannelsService : AudioChannelsService, private metronomeService : MetronomeService, private counterService: CounterService) { }

  ngOnInit(): void {
    this.counterService.getFinishedObservable().subscribe(this.startRecording.bind(this));
  }

  public recordBtnClicked() {
    if(this.isRecording) {
      this.stopRecording()
    }
    else {
      this.prepareForRecording();
    }
  }

  public playToggle() {
    this.isPlaying ?
      this.stopAll() :
      this.playAll();
  }

  public playAll() {
    this.audioChannelsService.playAll();
    this.isPlaying = true;
    var originalDuration = this.longestDuration;

    var durationInterval = setInterval(()=>{
      this.longestDuration -= 1;
      if(this.longestDuration <= 0) {
        this.longestDuration = originalDuration;
        this.isPlaying = false;
        clearInterval(durationInterval);
      }
    }, 1000);
  }

  public stopAll() {
    this.audioChannelsService.stopAll();
    this.isPlaying = false;
    this.longestDuration = -1;
  }

  public removeChannel(channel : AudioChannel) {
    var idx = this.channels.indexOf(channel);
    this.channels.splice(idx);
  }

  private prepareForRecording() {
    this.metronomeService.play();
    this.counterService.startCounting();
  }

  private startRecording() : void {
    this.startTimer();
    this.playAll();
    this.isRecording = true;

    var constraints = { audio: true, video:false };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(this.createStream.bind(this))
      .catch(function(err) {
        console.log(err);
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
    this.rec.record();

    console.log("Recording started");

  }

  private stopRecording() {
    this.stopTimer();
    this.metronomeService.stop();
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

    //add the li element to the ol
    //recordingsList.appendChild(li);
    this.channels.push({
      url:url,
      duration: this.currentRecordingDuration,
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
