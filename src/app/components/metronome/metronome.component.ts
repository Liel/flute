import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from 'rxjs';
import { MetronomeService } from 'src/app/services/metronome.service';

@Component({
  selector: "app-metronome",
  templateUrl: "./metronome.component.html",
  styleUrls: ["./metronome.component.scss"],
})
export class MetronomeComponent implements OnInit, OnDestroy {
  audioContext = null;
  notesInQueue = []; // notes that have been put into the web audio and may or may not have been played yet {note, time}
  currentQuarterNote = 0;
  tempo = 120;
  lookahead = 25; // How frequently to call scheduling function (in milliseconds)
  scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  nextNoteTime = 0.0; // when the next note is due
  isRunning = false;
  toggled = false;
  intervalID = null;

  playSubscriber: Subscription;
  stopSubscriber: Subscription;

  ngOnInit(): void {
    this.playSubscriber = this.metronomeService.getPlayObservable().subscribe(this.start.bind(this));
    this.stopSubscriber = this.metronomeService.getStopObservable().subscribe(this.stop.bind(this));
  }

  ngOnDestroy() {
    this.playSubscriber.unsubscribe();
    this.stopSubscriber.unsubscribe();
  }

  constructor(private metronomeService : MetronomeService) {}

  toggleMetronome() {
    this.metronomeService.isMetronomeOn = !this.metronomeService.isMetronomeOn;
  }

  play() {
    this.startStop();
  }

  changeTempo(tempo) {
    this.tempo += tempo;
    this.metronomeService.bpm = this.tempo;
  }

  nextNote() {
    // Advance current note and time by a quarter note (crotchet if you're posh)
    var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

    this.currentQuarterNote++; // Advance the beat number, wrap to zero
    if (this.currentQuarterNote == 4) {
      this.currentQuarterNote = 0;
    }
  }

  scheduleNote(beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    this.notesInQueue.push({ note: beatNumber, time: time });

    // create an oscillator
    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.frequency.value = beatNumber % 4 == 0 ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  scheduler() {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
      this.nextNote();
    }
  }

  start() {
    if (this.isRunning) return;

    if (this.audioContext == null) {
      this.audioContext = new AudioContext();
    }

    this.isRunning = true;

    this.currentQuarterNote = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isRunning = false;

    clearInterval(this.intervalID);
  }

  startStop() {
    if (this.isRunning) {
      this.metronomeService.stop(true);
    } else {
      this.metronomeService.play(true);
    }
  }
}
