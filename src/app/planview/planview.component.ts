import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import * as d3 from 'd3';
import * as Chart from 'chart.js'


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

    //chart js
    canvas: any;
    ctx: any;
    column = [];
    data = [];
    myChart: any;
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
            this.createGanttChart();
            this.generateChartsJsBar();
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
            this.createGanttChart();
            this.myChart.destroy();
            this.generateChartsJsBar();
        }).catch(error => {
        });
    }

    createGanttChart() {
        const barHeight = 30;

        // set the dimensions and margins of the graph
        let margin = { top: 20, right: 50, bottom: 30, left: 80 },
            width = 960 - margin.left - margin.right;
        // height = 500 - margin.top - margin.bottom;

        const height = Math.ceil((this.detailset.length + 0.1) * barHeight) + margin.top + margin.bottom;
        //remove existing svg and create new
        d3.select("body").select('svg').remove();

        //tooltip
        d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .attr('style', 'position: absolute; opacity: 0;')
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px 10px")

        // set the ranges
        let y = d3.scaleBand()
            .range([height, 0])
            .padding(0.2);

        let x = d3.scaleLinear()
            .range([0, width]);

        // moves the 'group' element to the top left margin
        let svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(this.detailset, function (d) { return d.totalDemand; })])
        y.domain(this.detailset.map(function (d) { return d.planDate; }));

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(this.detailset)
            .enter().append("rect")
            // .attr("fill", "steelblue")
            .attr("class", "bar")
            .attr("width", function (d) { return x(d.totalDemand); })
            .attr("y", function (d) { return y(d.planDate); })
            .attr("height", y.bandwidth())
            .on('mouseover', function (d) {
                d3.select('#tooltip').transition().duration(200).style('opacity', 1).text((d.planDate) + ":" + (d.totalDemand))
                // d3.select(this).attr("fill", "grey");
            })
            .on('mouseout', function () {
                d3.select('#tooltip').style('opacity', 0)
                // d3.select(this).attr("fill", "steelblue");
            })
            .on('mousemove', function () {
                d3.select('#tooltip')
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')
            })

        // add the x Axis
        var maxWidth = 0;

        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 11)
            .selectAll('text')
            .data(this.detailset)
            .enter().append('text')
            .attr('x', d => x(d.totalDemand))
            .attr('y', (d, i) => y(d.planDate) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text(d => (d.totalDemand));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y))
        // .selectAll("text").each(function () {
        //     if (this.getBBox().width > maxw) maxw = this.getBBox().width;
        // })
        // .attr("transform", "translate(" + maxw + ",0)");

        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", "translate(0," + height + ")")

    }

    generateChartsJsBar() {
        this.column = [];
        this.data = [];
        this.detailset.forEach(element => {
            this.column.push(element.planDate);
            this.data.push(element.totalDemand);
        });
        this.canvas = document.getElementById('myChart');
        this.ctx = this.canvas.getContext('2d');
        this.myChart = new Chart(this.ctx, {
            type: 'horizontalBar',
            data: {
                labels: this.column,
                datasets: [{
                    label: 'Planview Data',
                    data: this.data,
                    backgroundColor: 'rgb(220,220,220)',
                    hoverBackgroundColor: 'rgb(169,169,169)',
                    borderWidth: 1,
                    barThickness: 40,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }]
            },
            options: {
                responsive: false,
                display: true
            }
        });
    }
}
