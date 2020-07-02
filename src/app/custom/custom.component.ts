import { Component, OnInit } from '@angular/core';
import { PLAN_ROWS, PLAN_COLUMNS, planData } from './plan.config';
import * as d3 from 'd3';

@Component({
    selector: 'app-custom',
    templateUrl: './custom.component.html',
    styleUrls: ['./custom.component.scss']
})
export class CustomComponent implements OnInit {
    tableDetails: any = planData;
    planRowsConfig = PLAN_ROWS;
    columnConfig = JSON.parse(JSON.stringify(PLAN_COLUMNS));
    dataset = [];

    pshDataSet = {};
    constructor() { }

    ngOnInit(): void {
        this.generateRowData();
    }

    generateRowData() {
        const result = this.tableDetails.reduce(function (r, a) {
            r[a.planDate] = r[a.planDate] || [];
            r[a.planDate].push(a);
            return r;
        }, Object.create(null));

        this.dataset = result;
        console.log(this.dataset);
        this.tableDetails.forEach(element => {
            if (!this.pshDataSet.hasOwnProperty(element.planDate)) {
                this.pshDataSet[element.planDate] = {};
            }
            this.pshDataSet[element.planDate][element.keyFig] = element.quantity;
        });
        console.log(this.pshDataSet);
    }

}
