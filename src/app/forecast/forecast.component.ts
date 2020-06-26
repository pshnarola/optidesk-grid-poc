import { Component, OnInit, ViewChild } from '@angular/core';
import Handsontable from 'handsontable';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {

  detailset = [
    {
      bucket: 'wk01',
      forecast: ''
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
  ];;
  columnObj = [];
  forecastDateSet = [];
  private modalRef: NgbModalRef;
  hotSettings: Handsontable.GridSettings = {
    data: this.detailset,
    colHeaders: true,
    rowHeaders: true,
    columns: [
      {
        data: 'bucket',
        title: 'PLANBUCKET',
        readOnly: true
      },
      {
        data: 'forecast',
        title: 'FORECAST',
        type: 'numeric'
      },
    ],
    maxRows: this.detailset.length,
    cells: (row, column, prop) => {
      const cellProperties: any = {};
      return cellProperties;
    }
  };
  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.generateForecastGrid();
  }

  generateForecastGrid() {
    // this.detailset = 

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
              element['forecast'] = change[0][3];
            }
          });
        }
      }
    });
  }

  openHandsonTable(handsonContent) {
    this.modalRef = this.modalService.open(handsonContent);
    this.modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  saveForecast() {
    this.modalRef.close();
  }
}
