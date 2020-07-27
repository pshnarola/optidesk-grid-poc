import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';

@Component({
  selector: 'app-forecast-prototype',
  templateUrl: './forecast-prototype.component.html',
  styleUrls: ['./forecast-prototype.component.scss']
})
export class ForecastPrototypeComponent implements OnInit {
  tableDetails: any;
  loadData = false;
  dataSet = {};
  chartData = [];
  forecastData = [
    {
      planBucket: 'PlanBucket',
      forecast: 'Forecast'
    },
    {
      planBucket: 'WK.01 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.02 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.03 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.04 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.05 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.06 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.07 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.08 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.08 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.10 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.11 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.12 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.13 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.14 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.15 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.16 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.17 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.18 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.19 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.20 2020',
      forecast: ''
    },
  ];
  constructor(
    private shared: SharedService
  ) { }

  ngOnInit(): void {
  }

}
