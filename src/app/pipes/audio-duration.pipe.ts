import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'audioDuration'
})
export class AudioDurationPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    return this.fmtMSS(String(value));
  }

  fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}
}
