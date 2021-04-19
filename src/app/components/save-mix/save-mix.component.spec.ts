import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveMixComponent } from './save-mix.component';

describe('SaveMixComponent', () => {
  let component: SaveMixComponent;
  let fixture: ComponentFixture<SaveMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
