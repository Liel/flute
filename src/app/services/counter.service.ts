import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {

  private startSubject = new Subject<any>();
  private countFinishedSubject = new Subject<any>();

  startCounting() {
     this.startSubject.next();
  }

  fireFinished() {
    this.countFinishedSubject.next();
  }

  getStartObservable(): Observable<any> {
      return this.startSubject.asObservable();
  }

  getFinishedObservable(): Observable<any> {
      return this.countFinishedSubject.asObservable();
  }
}
