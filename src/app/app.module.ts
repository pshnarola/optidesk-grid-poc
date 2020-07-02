import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForecastComponent } from './forecast/forecast.component';
import { PlanviewComponent } from './planview/planview.component';
import { PlanviewAlternativeComponent } from './planview-alternative/planview-alternative.component';
import { HotTableModule } from '@handsontable/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HotComponent } from './hot/hot.component';
import { CustomComponent } from './custom/custom.component';

@NgModule({
  declarations: [
    AppComponent,
    ForecastComponent,
    PlanviewComponent,
    PlanviewAlternativeComponent,
    HotComponent,
    CustomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HotTableModule.forRoot(),
    NgbModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
