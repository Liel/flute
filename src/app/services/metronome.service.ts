import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetronomeService {

  isMetronomeOn: boolean = false;
  bpm: number = 120;

  private playSubject = new Subject<any>();
  private stopSubject = new Subject<any>();

  play(forcePlay = false) {
      if(forcePlay || this.isMetronomeOn)
        this.playSubject.next();
  }

  stop(forceStop = false) {
    if(forceStop || this.isMetronomeOn)
      this.stopSubject.next();
  }

  getPlayObservable(): Observable<any> {
      return this.playSubject.asObservable();
  }

  getStopObservable(): Observable<any> {
      return this.stopSubject.asObservable();
  }
}
