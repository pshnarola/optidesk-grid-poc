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
            forecast: null
        },
        {
            bucket: 'wk02',
            forecast: null
        },
        {
            bucket: 'wk03',
            forecast: null
        },
        {
            bucket: 'wk04',
            forecast: null
        },
        {
            bucket: 'wk05',
            forecast: null
        },
        {
            bucket: 'wk06',
            forecast: null
        },
        {
            bucket: 'wk07',
            forecast: null
        },
        {
            bucket: 'wk08',
            forecast: null
        }
    ];
    gridColumns = [];
    gridColumnIndex = {};
    gridDataSource = [];
    hotForecastGrid;
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
    constructor(
        private modalService: NgbModal
    ) { }

    ngOnInit() {
        this.generateForecastGrid();
    }

    generateForecastGrid() {
        this.gridDataSource = this.createForecastGridData();
        const example = document.getElementById('example');
        this.hotForecastGrid = new Handsontable(example, {
            data: this.gridDataSource,
            colWidths: 100,
            width: '100%',
            height: 320,
            rowHeights: 23,
            rowHeaders: false,
            colHeaders: true,
            columns: this.gridColumns,
            cells: (row, column, prop) => {
                const cellProperties: any = {};
                if (row === 0 && column === 0) {
                    cellProperties.readOnly = true;
                }
                return cellProperties;
            },
            afterChange: (change, source) => {
                if (change !== null) {
                    let newValue = Number(change[0][3]);
                    let columnName = change[0][1];
                    this.detailset[this.gridColumnIndex[columnName]].forecast = newValue;
                }
            }
        });
    }

    createForecastGridData() {
        const gridDataSource = [];
        this.gridColumns = [{
            title: 'Period',
            data: 'firstCol'
        }];
        const rowObj = {
            firstCol: 'Forecast'
        };
        this.detailset.forEach((element, index) => {
            const json = {};
            json['title'] = element.bucket;
            json['data'] = element.bucket;
            this.gridColumns.push(json);
            this.gridColumnIndex[element.bucket] = index;
            rowObj[element.bucket] = element.forecast;
        });
        gridDataSource.push(rowObj);
        return gridDataSource;
    }

    openHandsonTable(handsonContent) {
        this.modalRef = this.modalService.open(handsonContent);
        this.modalRef.result.then((result) => {
            this.hotForecastGrid.loadData(this.createForecastGridData());
        }, (reason) => {
        });
    }
}
