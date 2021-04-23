import { Component, OnInit } from '@angular/core';
import { CounterService } from 'src/app/services/counter.service';
import { MetronomeService } from 'src/app/services/metronome.service';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {
  count:number;
  countFrom = 3;
  counterInterval: NodeJS.Timeout;
  constructor(private counterService: CounterService, private metronomeService : MetronomeService) { }

  ngOnInit(): void {
    this.counterService.getStartObservable().subscribe(this.startCounting.bind(this));
  }

  startCounting() {
    this.count = this.countFrom;
    var seconds = this.metronomeService.bpm / 60; // beats per second

    this.counterInterval = setInterval(()=>{
      this.count--;
      if(this.count == 0) {
        clearInterval(this.counterInterval);
        this.counterService.fireFinished();
      }
    }, seconds * 1000);
  }





}
