import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Handsontable from 'handsontable';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as d3 from 'd3';

@Component({
    selector: 'app-forecast',
    encapsulation: ViewEncapsulation.None,
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
            rowHeights: 23,
            rowHeaders: false,
            colHeaders: true,
            columns: this.gridColumns,
            maxRows: 1,
            cells: (row, column, prop) => {
                const cellProperties: any = {};
                if (row === 0 && column === 0) {
                    cellProperties.readOnly = true;
                }
                return cellProperties;
            },
            afterChange: (change, source) => {
                if (change !== null) {
                    const newValue = Number(change[0][3]);
                    const columnName = change[0][1];
                    this.detailset[this.gridColumnIndex[columnName]].forecast = newValue;
                    this.createGanttChart();
                    // this.myChart.data.datasets[0].data[this.gridColumnIndex[columnName]] = newValue;
                    // this.myChart.update();
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
            const json = {
                title: element.bucket,
                data: element.bucket
            };
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
            this.createGanttChart();
        }, (reason) => {
        });
    }

    createGanttChart() {
        const barHeight = 30;

        // set the dimensions and margins of the graph
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 960 - margin.left - margin.right;

        const height = Math.ceil((this.detailset.length + 0.1) * barHeight) + margin.top + margin.bottom;
        d3.select('body').select('svg').remove();

        d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .attr('style', 'position: absolute; opacity: 0;')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '5px 10px');

        // set the ranges
        const y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

        const x = d3.scaleLinear()
            .range([0, width]);

        // moves the 'group' element to the top left margin
        const svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // Scale the range of the data in the domains
        x.domain([0, d3.max(this.detailset, d => d.forecast)]);
        y.domain(this.detailset.map(d => d.bucket));

        // append the rectangles for the bar chart
        svg.selectAll('.bar')
            .data(this.detailset)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('width', d => x(d.forecast))
            .attr('y', d => y(d.bucket))
            .attr('height', y.bandwidth())
            .on('mouseover', d => {
                d3.select('#tooltip').transition().duration(200).style('opacity', 1).text((d.bucket) + ':' + (d.forecast));
            })
            .on('mouseout', () => {
                d3.select('#tooltip').style('opacity', 0);
            })
            .on('mousemove', () => {
                d3.select('#tooltip')
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
            });

        // add the x Axis
        svg.append('g')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 12)
            .selectAll('text')
            .data(this.detailset)
            .enter().append('text')
            .attr('x', d => x(d.forecast))
            .attr('y', (d, i) => y(d.bucket) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('dx', -4)
            .text(d => (d.forecast));

        // add the y Axis
        svg.append('g')
            .call(d3.axisLeft(y));

        svg.append('g')
            .call(d3.axisBottom(x))
            .attr('transform', 'translate(0,' + height + ')');
    }

}
