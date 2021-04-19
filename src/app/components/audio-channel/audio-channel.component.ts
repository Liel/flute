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

  ngOnDestroy(): void {
    if(this.playAllSubscriber) {
      this.playAllSubscriber.unsubscribe();
    }
  }
}
