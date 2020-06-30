import { Component, OnInit } from '@angular/core';
import Handsontable from 'handsontable';
import { SharedService } from '../shared/services/shared.service';
import { PLAN_ROWS } from '../planview-alternative/planview-config';
import { HotTableRegisterer } from '@handsontable/angular';

@Component({
    selector: 'app-hot',
    templateUrl: './hot.component.html',
    styleUrls: ['./hot.component.scss']
})
export class HotComponent implements OnInit {
    tableId = 'updateTable';
    planRowsConfig = PLAN_ROWS;
    apiResponse = [];
    hotDataSource = [];
    hotColumns = [];
    columnIndexAPI = {};
    columnIdentifier = 'planDate';
    updateSettings: Handsontable.GridSettings = {
        rowHeaders: false,
        colHeaders: true,
        autoColumnSize: true,
        autoRowSize: true,
        selectionMode: 'single',
        allowInvalid: false,
        maxRows: this.planRowsConfig.length,
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
        beforeKeyDown: (event) => {
            const invalidKeys = ['-', '+']
            if (invalidKeys.indexOf(event.key) > -1) {
                event.preventDefault();
            }
        },
        afterChange: (change, source) => {
            if (change && source.toString() !== 'api') {
                const currentColumn = change[0][1];
                const newValue = change[0][3];
                const oldValue = change[0][2];
                if (newValue !== oldValue) {
                    this.updatePivotData(newValue, currentColumn);
                }
            }
        },
        afterValidate: (isValid, value, row, prop, source) => {
            return (isValid && value >= 0);
        }
    };

    constructor(
        private shared: SharedService,
        private hotRegisterer: HotTableRegisterer
    ) { }

    ngOnInit() {
        this.getDemandDetails();
    }

    getDemandDetails() {
        this.shared.getDemandDetails().then(response => {
            this.apiResponse = response.demands;
            this.createColumns();
        }).catch(error => {
        });
    }

    createColumns() {
        this.hotColumns = [
            {
                data: 'rowHeader',
                title: 'Key Figure',
                isBold: true,
                textAlign: 'left',
                readOnly: false
            }
        ];
        this.apiResponse.forEach((detail, index) => {
            this.hotColumns.push({
                data: detail[this.columnIdentifier],
                title: detail[this.columnIdentifier],
                type: 'numeric',
                allowEmpty: false
            });
            this.columnIndexAPI[detail[this.columnIdentifier]] = index;
        });
        this.hotDataSource = this.createForecastGridData();
        this.updateSettings.columns = this.hotColumns;
        this.updateSettings.data = this.hotDataSource;
    }

    createForecastGridData() {
        const hotDataSource = [];
        this.planRowsConfig.forEach((row, index) => {
            const rowObj: any = {};
            this.hotColumns.forEach(column => {
                if (column.data === 'rowHeader') {
                    rowObj[column.data] = row.title;
                } else {
                    const recordIndex = this.columnIndexAPI[column.data];
                    rowObj[column.data] = '';
                    rowObj[column.data] = this.apiResponse[recordIndex][row.data];
                }
            });
            hotDataSource.push(rowObj);
        });
        return hotDataSource;
    }

    updatePivotData(newValue, currentColumn) {
        const json = {
            planDate: currentColumn,
            independentDemand: newValue
        };
        this.shared.updateDemadDetails(json).then(response => {
            const columnIndex = this.columnIndexAPI[currentColumn] + 1;
            this.apiResponse[columnIndex - 1] = response;
            this.planRowsConfig.forEach((rowConfig, index) => {
                this.hotRegisterer.getInstance(this.tableId).setDataAtCell(index, columnIndex, response[rowConfig.data], 'api');
            });
        }).catch(error => {
        });
    }

}
