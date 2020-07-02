import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForecastComponent } from './forecast/forecast.component';
import { PlanviewComponent } from './planview/planview.component';
import { PlanviewAlternativeComponent } from './planview-alternative/planview-alternative.component';
import { HotComponent } from './hot/hot.component';
import { CustomComponent } from './custom/custom.component';


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
    path: 'custom',
    component: CustomComponent
  },
  {
    path: '',
    redirectTo: 'custom',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
