import { Component, OnInit } from '@angular/core';
import Handsontable from 'handsontable';
import { SharedService } from '../shared/services/shared.service';
import { PLAN_ROWS, PLAN_COLUMNS } from './planview-config';

@Component({
  selector: 'app-planview-alternative',
  templateUrl: './planview-alternative.component.html',
  styleUrls: ['./planview-alternative.component.scss']
})
export class PlanviewAlternativeComponent implements OnInit {
  detailset = [];
  gridDataSource = [];
  gridColumns = [];
  planRowsConfig = PLAN_ROWS;
  columnConfig = JSON.parse(JSON.stringify(PLAN_COLUMNS));
  columnIndexAPI = {};
  constructor(private shared: SharedService) { }


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

  ngOnInit() {
    this.getDemandDetails();
  }

  getDemandDetails() {
    this.shared.getDemandDetails().then(response => {
      this.detailset = response['demands'];
      this.detailset.forEach((element, index) => {
        this.columnIndexAPI[element[this.columnConfig.columnIdentifier]] = index;
      });
      this.generateHandsonTable();
    }).catch(error => {
    });
  }

  generateHandsonTable() {
    this.gridDataSource = this.createForecastGridData();

    var example = document.getElementById('example');
    var hot1 = new Handsontable(example, {
      data: this.gridDataSource,
      width: '100%',
      height: 320,
      rowHeights: 23,
      rowHeaders: true,
      colHeaders: true,
      columns: this.gridColumns,
      colWidths: (index) => {
        if (index === 0) {
          return '350px';
        }
        return '100px';
      },
      cells: (row, column, prop) => {
        const cellProperties: any = {};
        if (column === 0) {
          cellProperties.readOnly = true;
        }
        return cellProperties;
      },
      afterChange: (change, source) => {
        if (change !== null) {
          //  let currentColumn = change[0][1];
          //  let newValue = Number(change[0][3]);
          //  this.detailset.forEach((element, index) => {
          //     if(element.hasOwnProperty(currentColumn)) {
          //       this.detailset[index][currentColumn] = newValue;
          //     }
          //  });
          //  hot1.loadData(this.detailset);
        }
      }
    });
  }

  createForecastGridData() {
    const gridDataSource = [];
    this.gridColumns = this.columnConfig.columns;

    this.planRowsConfig.forEach((row, index) => {
      const rowObj: any = {};
      this.columnConfig.columns.forEach(column => {
        if (column.key === 'rowHeader') {
          rowObj[column.key] = row.title;
        } else {
          const recordIndex = this.columnIndexAPI[column.key];
          console.log('record index', recordIndex)
          rowObj[column.key] = '';
          rowObj[column.key] = this.detailset[recordIndex][row.key];
        }
      });
      gridDataSource.push(rowObj);
    });
    return gridDataSource;
  }

}
