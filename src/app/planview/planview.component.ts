import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable/angular';
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
        autoColumnSize: true,
        allowInvalid: false,
        cells: (row, column, prop) => {
            const cellProperties: any = {};
            return cellProperties;
        },
        afterChange: (change, source) => {
            if (change !== null) {
                let currentRow = change[0][0];
                let newValue = Number(change[0][3]);
                let cell = this.detailset[currentRow];
                let oldValue = Number(change[0][2]);
                if (newValue !== oldValue) {
                    this.updatePivotData(newValue, cell, currentRow);
                }
            }
        }
    };

    constructor(
        private shared: SharedService,
        private hotRegisterer: HotTableRegisterer
    ) { }

    ngOnInit(): void {
        this.getDemandDetails();
    }

    getDemandDetails() {
        this.shared.getDemandDetails().then(response => {
            this.detailset = response['demands'];
        }).catch(error => {
        });
    }

    updatePivotData(newValue, cell, currentRow) {
        const json = {};
        json['planDate'] = cell['planDate']
        json['independentDemand'] = newValue;
        this.shared.updateDemadDetails(json).then(response => {
            this.detailset[currentRow] = response;
            this.hotRegisterer.getInstance(this.tableId).loadData(this.detailset);
        }).catch(error => {
        });
    }
}
