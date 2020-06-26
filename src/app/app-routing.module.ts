import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForecastComponent } from './forecast/forecast.component';
import { PlanviewComponent } from './planview/planview.component';


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
      path: '',
      redirectTo: 'forecast',
      pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
