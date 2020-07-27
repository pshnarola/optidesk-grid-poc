import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForecastComponent } from './forecast/forecast.component';
import { PlanviewComponent } from './planview/planview.component';
import { PlanviewAlternativeComponent } from './planview-alternative/planview-alternative.component';
import { HotComponent } from './hot/hot.component';
import { CustomComponent } from './custom/custom.component';
import { CustomUiComponent } from './custom-ui/custom-ui.component';
import { CustomExcelComponent } from './custom-excel/custom-excel.component';
import { ForecastPrototypeComponent } from './forecast-prototype/forecast-prototype.component';


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
    path: 'custom-ui',
    component: CustomUiComponent
  },
  {
    path: 'custom-excel',
    component: CustomExcelComponent
  },
  {
    path: 'forecast-prototype',
    component: ForecastPrototypeComponent
  },
  {
    path: '',
    redirectTo: 'forecast-prototype',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
