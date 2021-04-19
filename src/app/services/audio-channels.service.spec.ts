import { TestBed } from '@angular/core/testing';

import { AudioChannelsService } from './audio-channels.service';

describe('AudioChannelsService', () => {
  let service: AudioChannelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioChannelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
