import { Component, OnInit } from '@angular/core';
import Handsontable from 'handsontable';
import { SharedService } from '../shared/services/shared.service';
import { PLAN_ROWS } from './planview-config';
import { HotTableRegisterer } from '@handsontable/angular';

@Component({
    selector: 'app-planview-alternative',
    templateUrl: './planview-alternative.component.html',
    styleUrls: ['./planview-alternative.component.scss']
})
export class PlanviewAlternativeComponent implements OnInit {
    tableId = 'updateTable';
    detailset = [];
    gridDataSource = [];
    gridColumns = [];
    planRowsConfig = PLAN_ROWS;
    columnIndexAPI = {};
    columnIdentifier = 'planDate';
    updateSettings: Handsontable.GridSettings = {
        rowHeaders: false,
        colHeaders: true,
        autoColumnSize: true,
        autoRowSize: true,
        selectionMode: 'single',
        allowInvalid: false,
        cells: (row, column, prop) => {
            const cellProperties: any = {};
            const rowConfig = PLAN_ROWS[row];
            if (rowConfig) {
                cellProperties.readOnly = rowConfig.readOnly;
                if (column === 0) {
                    cellProperties.readOnly = true;
                }
            }
            return cellProperties;
        },
        afterChange: (change, source) => {
            if (change && source.toString() !== 'api') {
                let currentColumn = change[0][1];
                let newValue = Number(change[0][3]);
                let oldValue = Number(change[0][2]);
                if (newValue !== oldValue) {
                    this.updatePivotData(newValue, currentColumn)
                }
            }
        }
    }
    constructor(
        private shared: SharedService,
        private hotRegisterer: HotTableRegisterer
    ) { }

    ngOnInit() {
        this.getDemandDetails();
    }

    getDemandDetails() {
        this.shared.getDemandDetails().then(response => {
            this.detailset = response['demands'];
            this.createColumns();
        }).catch(error => {
        });
    }

    createColumns() {
        this.gridColumns = [
            {
                data: 'rowHeader',
                title: 'Key Figure',
                isBold: true,
                textAlign: 'left',
                readOnly: false
            }
        ];
        this.detailset.forEach((detail, index) => {
            this.gridColumns.push({
                data: detail[this.columnIdentifier],
                title: detail[this.columnIdentifier],
                type: 'numeric'
            });
            this.columnIndexAPI[detail[this.columnIdentifier]] = index;
        });
        this.gridDataSource = this.createForecastGridData();
        this.updateSettings.columns = this.gridColumns;
        this.updateSettings.data = this.gridDataSource;
    }


    createForecastGridData() {
        const gridDataSource = [];
        this.planRowsConfig.forEach((row, index) => {
            const rowObj: any = {};
            this.gridColumns.forEach(column => {
                if (column.data === 'rowHeader') {
                    rowObj[column.data] = row.title;
                } else {
                    const recordIndex = this.columnIndexAPI[column.data];
                    rowObj[column.data] = '';
                    rowObj[column.data] = this.detailset[recordIndex][row.data];
                }
            });
            gridDataSource.push(rowObj);
        });
        return gridDataSource;
    }

    updatePivotData(newValue, currentColumn) {
        const json = {};
        json['planDate'] = currentColumn;
        json['independentDemand'] = newValue;
        this.shared.updateDemadDetails(json).then(response => {
            const columnIndex = this.columnIndexAPI[currentColumn] + 1;
            this.planRowsConfig.forEach((rowConfig, index) => {
                this.hotRegisterer.getInstance(this.tableId).setDataAtCell(index, columnIndex, response[rowConfig.data], 'api');
            });
        }).catch(error => {
        });
    }
}
