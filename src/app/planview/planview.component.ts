import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-planview',
  templateUrl: './planview.component.html',
  styleUrls: ['./planview.component.scss']
})
export class PlanviewComponent implements OnInit {
  detailset = [];
  tableId = 'updateTable';
  updateSettings: Handsontable.GridSettings = {
    colHeaders: true,
    rowHeaders: true,
    selectionMode: 'single',
    autoColumnSize: false,
    colWidths: (index) => {
      if (index === 0) {
        return '150px';
      }
      return '100px';
    },
    cells: (row, column, prop) => {
      const cellProperties: any = {};
      return cellProperties;
    },
    afterChange: (change, source) => {
      if (change !== null) {
        let currentRow = change[0][0];
        let newValue = Number(change[0][3]);
        let cell = this.detailset[currentRow];
        console.log('current row', currentRow);
        console.log('newValue', newValue);
        console.log('cell', cell);
        this.updatePivotData(newValue, cell, currentRow);
      }
    }
  };

  response = {
    "demands": [
      {
        "planDate": "25/06/2020",
        "independentDemand": 100,
        "dependentDemand": 50,
        "totalDemand": 150
      },
      {
        "planDate": "26/06/2020",
        "independentDemand": 100,
        "dependentDemand": 50,
        "totalDemand": 150
      }
    ]
  }
  constructor(private shared: SharedService) { }

  ngOnInit(): void {
    this.getDemandDetails();
  }

  getDemandDetails() {
    this.detailset = this.response['demands'];
    this.shared.getDemandDetails().then(response => {
      // this.detailset = response['demands'];
      console.log('details', this.detailset)
    }).catch(error => {
    });
  }

  updatePivotData(newValue, cell, currentRow) {
    const json = {};
    json['planDate'] = cell['planDate']
    json['independentDemand'] = newValue;
    console.log('post json', json)
    this.shared.updateDemadDetails(json).then(response => {
      // this.detailset[currentRow] = response;
      //  this.hotRegisterer.getInstance(this.tableId).loadData(this.detailset);
    }).catch(error => {
    });
  }
}
