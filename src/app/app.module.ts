import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FormsModule} from "@angular/forms";
import {TrelloApiService} from "./_services/trello-api.service";
import {HttpClientModule} from "@angular/common/http";
import {BlockUIModule} from "ng-block-ui";
import { OnlineStatusComponent } from './home/online-status/online-status.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OnlineStatusComponent
  ],
  imports: [
    BlockUIModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TrelloApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
