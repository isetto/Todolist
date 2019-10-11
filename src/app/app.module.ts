import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { ListComponent } from './home/list/list.component';
import { CardComponent } from './home/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ListComponent,
    CardComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
