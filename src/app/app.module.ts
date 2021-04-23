import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateComponent } from './components/create/create.component';
import { AudioChannelComponent } from './components/audio-channel/audio-channel.component';
import { SaveMixComponent } from './components/save-mix/save-mix.component';
import { AudioDurationPipe } from './pipes/audio-duration.pipe';
import { MetronomeComponent } from './components/metronome/metronome.component';
import { CounterComponent } from './components/counter/counter.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateComponent,
    AudioChannelComponent,
    SaveMixComponent,
    AudioDurationPipe,
    MetronomeComponent,
    CounterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
