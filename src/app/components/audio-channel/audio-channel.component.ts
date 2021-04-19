import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AudioChannel } from 'src/app/models/audio-channel.model';
import { AudioChannelsService } from 'src/app/services/audio-channels.service';

@Component({
  selector: 'app-audio-channel',
  templateUrl: './audio-channel.component.html',
  styleUrls: ['./audio-channel.component.scss']
})
export class AudioChannelComponent implements OnInit, OnDestroy {
  @Input("channel") channel : AudioChannel;
  @Output() remove = new EventEmitter<AudioChannel>();

  sanitizedUrl : SafeUrl;
  playAllSubscriber: Subscription;
  isPlaying : boolean = false;

  $player: HTMLAudioElement;

  @ViewChild('stream') set playerRef(ref: ElementRef<HTMLAudioElement>) {
    this.$player = ref.nativeElement;
  }

  constructor(private sanitizer:DomSanitizer, private audioChannelsService : AudioChannelsService) { }

  ngOnInit(): void {
    this.sanitizedUrl = this.sanitize(this.channel.url);
    this.playAllSubscriber = this.audioChannelsService.getPlayObservable().subscribe(this.playAudio.bind(this));
  }

  playAudio() {
    this.$player.preload = "0";
    this.$player.play();
    this.detectPlayerIsPlaying();
  }

  pauseAudio() {
    this.$player.pause();
    this.isPlaying = false;
  }

  detectPlayerIsPlaying() {
    this.isPlaying = true;
    var i = setInterval(()=>{
      if(this.$player.paused || !this.isPlaying) {
        this.isPlaying = false;
        clearInterval(i);
      }
    }, 1000);
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  removeChannel() {
    this.remove.emit(this.channel);
  }

  // audioContext = new AudioContext();

  // private drawAudio = url => {
  //   fetch(url)
  //     .then(response => response.arrayBuffer())
  //     .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
  //     .then(audioBuffer => this.draw(this.normalizeData(this.filterData(audioBuffer))));
  // };

  // /**
  //  * Filters the AudioBuffer retrieved from an external source
  //  * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
  //  * @returns {Array} an array of floating point numbers
  //  */
  // private filterData = audioBuffer => {
  //   const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  //   const samples = 70; // Number of samples we want to have in our final data set
  //   const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  //   const filteredData = [];
  //   for (let i = 0; i < samples; i++) {
  //     let blockStart = blockSize * i; // the location of the first sample in the block
  //     let sum = 0;
  //     for (let j = 0; j < blockSize; j++) {
  //       sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
  //     }
  //     filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
  //   }
  //   return filteredData;
  // };

  // /**
  //  * Normalizes the audio data to make a cleaner illustration
  //  * @param {Array} filteredData the data from filterData()
  //  * @returns {Array} an normalized array of floating point numbers
  //  */
  // const normalizeData = filteredData => {
  //     const multiplier = Math.pow(Math.max(...filteredData), -1);
  //     return filteredData.map(n => n * multiplier);
  // }

  // /**
  //  * Draws the audio file into a canvas element.
  //  * @param {Array} normalizedData The filtered array returned from filterData()
  //  * @returns {Array} a normalized array of data
  //  */
  // private draw = normalizedData => {
  //   // set up the canvas
  //   const canvas = document.querySelector("canvas");
  //   const dpr = window.devicePixelRatio || 1;
  //   const padding = 20;
  //   canvas.width = canvas.offsetWidth * dpr;
  //   canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  //   const ctx = canvas.getContext("2d");
  //   ctx.scale(dpr, dpr);
  //   ctx.translate(0, canvas.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas

  //   // draw the line segments
  //   const width = canvas.offsetWidth / normalizedData.length;
  //   for (let i = 0; i < normalizedData.length; i++) {
  //     const x = width * i;
  //     let height = normalizedData[i] * canvas.offsetHeight - padding;
  //     if (height < 0) {
  //         height = 0;
  //     } else if (height > canvas.offsetHeight / 2) {
  //         height = height > canvas.offsetHeight / 2;
  //     }
  //     this.drawLineSegment(ctx, x, height, width, (i + 1) % 2);
  //   }
  // };

  // /**
  //  * A utility function for drawing our line segments
  //  * @param {AudioContext} ctx the audio context
  //  * @param {number} x  the x coordinate of the beginning of the line segment
  //  * @param {number} height the desired height of the line segment
  //  * @param {number} width the desired width of the line segment
  //  * @param {boolean} isEven whether or not the segmented is even-numbered
  //  */
  // private drawLineSegment = (ctx, x, height, width, isEven) => {
  //   ctx.lineWidth = 1; // how thick the line is
  //   ctx.strokeStyle = "#fff"; // what color our line is
  //   ctx.beginPath();
  //   height = isEven ? height : -height;
  //   ctx.moveTo(x, 0);
  //   ctx.lineTo(x, height);
  //   ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
  //   ctx.lineTo(x + width, 0);
  //   ctx.stroke();
  // };

  // this.drawAudio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3');

  ngOnDestroy(): void {
    if(this.playAllSubscriber) {
      this.playAllSubscriber.unsubscribe();
    }
  }
}
