import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioChannelsService {

  public sources = [];
  private playSubject = new Subject<any>();
  private stopSubject = new Subject<any>();

  playAll() {
      this.playSubject.next();
  }

  stopAll() {
      this.stopSubject.next();
  }

  getPlayObservable(): Observable<any> {
      return this.playSubject.asObservable();
  }

  getStopObservable(): Observable<any> {
      return this.stopSubject.asObservable();
  }

}
