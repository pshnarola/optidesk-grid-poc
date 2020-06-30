import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForecastComponent } from './forecast/forecast.component';
import { PlanviewComponent } from './planview/planview.component';
import { PlanviewAlternativeComponent } from './planview-alternative/planview-alternative.component';
import { HotComponent } from './hot/hot.component';


const routes: Routes = [
  {
    path: 'forecast',
    component: ForecastComponent
  },
  {
    path: 'plan-view-approach-1',
    component: PlanviewComponent
  },
  {
    path: 'plan-view-approach-2',
    component: PlanviewAlternativeComponent
  },
  {
    path: 'handsontable',
    component: HotComponent
  },
  {
    path: '',
    redirectTo: 'handsontable',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
