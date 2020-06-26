import { Component, OnInit } from '@angular/core';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {
  detailset = [];
  columnObj = [];
  forecastDateSet = [];
  constructor() { }

  ngOnInit() {
    this.generateForecastGrid();
  }

  generateForecastGrid() {
    this.detailset = [
      {
        bucket: 'wk01',
        forecast: '1'
      },
      {
        bucket: 'wk02',
        forecast: ''
      },
      {
        bucket: 'wk03',
        forecast: ''
      },
      {
        bucket: 'wk04',
        forecast: ''
      },
      {
        bucket: 'wk05',
        forecast: ''
      },
      {
        bucket: 'wk06',
        forecast: ''
      },
      {
        bucket: 'wk07',
        forecast: ''
      },
      {
        bucket: 'wk08',
        forecast: ''
      }
    ];

    let rowObj: any = {};
    this.detailset.forEach(element => {
      const json = {};
      json['title'] = element.bucket;
      json['data'] = element.bucket;
      this.columnObj.push(json)
    });

    this.detailset.forEach((element) => {
      rowObj[element.bucket] = element.forecast
      this.forecastDateSet.push(rowObj);
    });

    this.forecastDateSet = [...new Set(this.forecastDateSet)];

    var example = document.getElementById('example');
    var hot1 = new Handsontable(example, {
      data: this.forecastDateSet,
      colWidths: 100,
      width: '100%',
      height: 320,
      rowHeights: 23,
      rowHeaders: true,
      colHeaders: true,
      columns: this.columnObj,
      afterChange: (change, source) => {
        if (change !== null) {
          let newValue = Number(change[0][3]);
          let columnName = change[0][1];
          this.detailset.forEach(element => {
            if (element.bucket == columnName) {
              element['forecast'] = newValue;
            }
          });
        }
      }
    });
  }
}
