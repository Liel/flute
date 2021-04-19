import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AudioChannelsService } from 'src/app/services/audio-channels.service';

@Component({
  selector: 'app-save-mix',
  templateUrl: './save-mix.component.html',
  styleUrls: ['./save-mix.component.scss']
})
export class SaveMixComponent {
    @Input("sources") sources : string[];
  audioDownload: string;


    constructor(private audioChannelsService : AudioChannelsService) {
     }
    description = "HiddenTribeAnthem";
    context;
    recorder;
    len : any;
    completedMixBlob : string;
    mix : any;
    div = document.querySelector("div");
    duration = 60000;
    chunks = [];
    audio = new AudioContext();
    mixedAudio = this.audio.createMediaStreamDestination();
    player = new Audio();
    // this.player.controls = "controls";

    public get(src) {
      return fetch(src)
        .then(function(response) {
          return response.arrayBuffer()
        })
    }

    public  stopMix(duration, ...media) {
      setTimeout(function(media) {
        media.forEach(function(node) {
          node.stop()
        })
      }, duration, media)
    }

    public async save() {
      var channels = this.audioChannelsService.sources.map(this.get);
      Promise.all(channels).then(await this.prepareToSave.bind(this))
      .catch(function(e) {
        console.log(e)
      });
    }

    private prepareToSave(data) {
        this.len = Math.max.apply(Math, data.map(function(buffer : any) {
          return buffer.byteLength
        }));
        this.context = new OfflineAudioContext(2, this.len, 44100);
        return Promise.all(data.map(this.decodeAudio.bind(this)))
          .then(this.startRendering.bind(this))
          // .then(function(renderedBuffer) {
          //   return new Promise(this.createBlob.bind(this))
          // });
    }

    private setBlobDownloadUrl(blob : any) : void {
      console.log(blob);
      // div.innerHTML = "mixed audio tracks ready for download..";
      this.audioDownload = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.download = "dfsdf" + "." + blob.type.replace(/.+\/|;.+/g, "");
      a.href = this.audioDownload;
      a.innerHTML = a.download;
      document.body.appendChild(a);
      // a.insertAdjacentHTML("afterend", "<br>");
      this.player.src = this.audioDownload;
      this.completedMixBlob = this.audioDownload;
    };

  private createBlob(renderedBuffer) {
      this.mix = this.audio.createBufferSource();
      this.mix.buffer = renderedBuffer;
      this.mix.connect(this.audio.destination);
      this.mix.connect(this.mixedAudio);
      this.recorder = new MediaRecorder(this.mixedAudio.stream);
      this.recorder.start(0);
      this.mix.start(0);
      //div.innerHTML = "playing and recording tracks..";
      // stop playback and recorder in 60 seconds
      this.stopMix(this.duration, this.mix, this.recorder);

      this.recorder.ondataavailable = (function (event) {
        this.chunks.push(event.data);
      }).bind(this);

      this.recorder.onstop = (function (event) {
        var blob = new Blob(this.chunks, {
          "type": "audio/ogg; codecs=opus"
        });
        console.log("recording complete");
        this.setBlobDownloadUrl(blob);
      }).bind(this);
  }

  private async startRendering() {
    var buffer = await this.context.startRendering();
    this.createBlob(buffer);
  }

    private createSrc(bufferSource) {
        var source = this.context.createBufferSource();
        source.buffer = bufferSource;
        source.connect(this.context.destination);
        return source.start()
    }

    private decodeAudio(buffer) {
        return this.audio.decodeAudioData(buffer)
          .then(this.createSrc.bind(this))
    }

}

