import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioChannelsService {

  public sources = [];
  private subject = new Subject<any>();

  playAll() {
      this.subject.next();
  }

  getPlayObservable(): Observable<any> {
      return this.subject.asObservable();
  }

}
