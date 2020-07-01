import { Component, OnInit } from '@angular/core';
import Handsontable from 'handsontable';
import { SharedService } from '../shared/services/shared.service';
import { PLAN_ROWS } from './planview-config';
import { HotTableRegisterer } from '@handsontable/angular';
import * as d3 from 'd3';
import * as Chart from 'chart.js';

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

    ngOnInit() {
        // this.getDemandDetails();
        this.test();
        // this.test2();
    }

    getDemandDetails() {
        this.shared.getDemandDetails().then(response => {
            this.detailset = response['demands'];
            this.createGanttChart();
            this.createColumns();
            this.generateChartsJsBar();
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
            this.detailset[columnIndex - 1] = response;
            this.planRowsConfig.forEach((rowConfig, index) => {
                this.hotRegisterer.getInstance(this.tableId).setDataAtCell(index, columnIndex, response[rowConfig.data], 'api');
            });
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
        d3.select('body').select('svg').remove();

        //tooltip
        d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .attr('style', 'position: absolute; opacity: 0;')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '5px 10px')

        // set the ranges
        let y = d3.scaleBand()
            .range([height, 0])
            .padding(0.2);

        let x = d3.scaleLinear()
            .range([0, width]);

        // moves the 'group' element to the top left margin
        let svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // Scale the range of the data in the domains
        x.domain([0, d3.max(this.detailset, function (d) { return d.totalDemand; })])
        y.domain(this.detailset.map(function (d) { return d.planDate; }));

        // append the rectangles for the bar chart
        svg.selectAll('.bar')
            .data(this.detailset)
            .enter().append('rect')
            // .attr('fill', 'steelblue')
            .attr('class', 'bar')
            .attr('width', function (d) { return x(d.totalDemand); })
            .attr('y', function (d) { return y(d.planDate); })
            .attr('height', y.bandwidth())
            .on('mouseover', function (d) {
                d3.select('#tooltip').transition().duration(200).style('opacity', 1).text((d.planDate) + ':' + (d.totalDemand))
                // d3.select(this).attr('fill', 'grey');
            })
            .on('mouseout', function () {
                d3.select('#tooltip').style('opacity', 0)
                // d3.select(this).attr('fill', 'steelblue');
            })
            .on('mousemove', function () {
                d3.select('#tooltip')
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')
            })

        // add the x Axis
        const maxWidth = 0;

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
        svg.append('g')
            .call(d3.axisLeft(y))
        // .selectAll('text').each(function () {
        //     if (this.getBBox().width > maxw) maxw = this.getBBox().width;
        // })
        // .attr('transform', 'translate(' + maxw + ',0)');

        svg.append('g')
            .call(d3.axisBottom(x))
            .attr('transform', 'translate(0,' + height + ')')

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
                    minBarLength: 20
                }]
            },
            options: {
                responsive: false,
                display: true,
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                    }]
                },
            }
        });
    }

    test() {
        const data = [
            {
                timescale: '01-07-2020',
                totalAmount: 20,
                totalProfit: 200,
                totalRevenue: 400
            },
            {
                timescale: '02-07-2020',
                totalAmount: 40,
                totalProfit: 300,
                totalRevenue: 600
            },
            {
                timescale: '03-07-2020',
                totalAmount: 70,
                totalProfit: 100,
                totalRevenue: 800
            },
            {
                timescale: '04-07-2020',
                totalAmount: 100,
                totalProfit: 800,
                totalRevenue: 900
            }
        ];
        const trendsText = {
            totalAmount: 'Total Amount',
            totalProfit: 'Total Profit',
            totalRevenue: 'Total Revenue'
        };

        // set the dimensions and margins of the graph
        const margin = { top: 20, right: 80, bottom: 50, left: 50 };
        const svg = d3.select('svg');
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;
        const g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // set the ranges
        const x = d3.scaleBand().rangeRound([0, width]).padding(1);
        const y = d3.scaleLinear().rangeRound([height, 0]);
        const z = d3.scaleOrdinal(['#036888', '#0D833C', '#D2392A']);

        // define the line
        const line = d3.line()
            .x(d => x(d.timescale))
            .y(d => y(d.total));

        // scale the range of the data
        z.domain(d3.keys(data[0]).filter(key => {
            return key !== 'timescale';
        }));

        const trends = z.domain().map(name => {
            return {
                name,
                values: data.map(d => {
                    return {
                        timescale: d.timescale,
                        total: +d[name]
                    };
                })
            };
        });
        x.domain(data.map(d => d.timescale));
        y.domain([0, d3.max(trends, c => {
            return d3.max(c.values, v => {
                return v.total;
            });
        })]);

        // Draw the legend
        const legend = g.selectAll('g')
            .data(trends)
            .enter()
            .append('g')
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', (d, i) => (i) * 150)
            // .attr('y', (d, i) => height / 2 - (i + 1) * 20)
            .attr('y', (d, i) => height + 30)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', d => z(d.name));

        legend.append('text')
            .attr('x', (d, i) => (i) * 150 + 20)
            // .attr('y', (d, i) => height / 2 - (i + 1) * 20 + 10)
            .attr('y', (d, i) => height + 30 + 10)
            .text((d) => trendsText[d.name]);

        // Draw the line
        const trend = g.selectAll('.trend')
            .data(trends)
            .enter()
            .append('g')
            .attr('class', 'trend');

        trend.append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .style('stroke', d => z(d.name));

        // Draw the empty value for every point
        const points = g.selectAll('.points')
            .data(trends)
            .enter()
            .append('g')
            .attr('class', 'points')
            .append('text');

        // Draw the circle
        trend
            .style('fill', d => z(d.name))
            .style('stroke', d => z(d.name))
            .selectAll('circle.line')
            .data(d => d.values)
            .enter()
            .append('circle')
            .attr('r', 5)
            .style('stroke-width', 3)
            .attr('cx', d => x(d.timescale))
            .attr('cy', d => y(d.total));


        // Draw the axis
        g.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis axis-y')
            .call(d3.axisLeft(y).ticks(10));

        const focus = g.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('y1', 0)
            .attr('y2', height);

        svg.append('rect')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('mousemove', mousemove);

        const timeScales = data.map(name => x(name.timescale));

        function mouseover() {
            focus.style('display', null);
            d3.selectAll('.points text').style('display', null);
        }
        function mouseout() {
            focus.style('display', 'none');
            d3.selectAll('.points text').style('display', 'none');
        }
        function mousemove() {
            const i = d3.bisect(timeScales, d3.mouse(this)[0], 1);
            const di = data[i - 1];
            focus.attr('transform', 'translate(' + x(di.timescale) + ',0)');
            d3.selectAll('.points text')
                .attr('x', d => x(di.timescale) + 15)
                .attr('y', d => y(d.values[i - 1].total))
                .text(d => d.values[i - 1].total)
                .style('fill', d => z(d.name));
        }
    }

    test2() {
        const margin = { top: 40, right: 120, bottom: 30, left: 40 };
        const width = 900 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const data = [
            {
                "name": "Independent Demand",
                "show": true,
                "color": "red",
                "currentPopulation": 37253956,
                "history": [
                    {
                        "year": 1910,
                        "population": 2377
                    },
                    {
                        "year": 1920,
                        "population": 3426
                    },
                    {
                        "year": 1930,
                        "population": 5677
                    },
                    {
                        "year": 1940,
                        "population": 6907
                    },
                    {
                        "year": 1950,
                        "population": 1058
                    },
                    {
                        "year": 1960,
                        "population": 1571
                    },
                    {
                        "year": 1970,
                        "population": 1995
                    },
                    {
                        "year": 1980,
                        "population": 2366
                    },
                    {
                        "year": 1990,
                        "population": 2976
                    },
                    {
                        "year": 2000,
                        "population": 3387
                    },
                    {
                        "year": 2010,
                        "population": 3725
                    }
                ]
            },
            {
                "name": "Michigan",
                "show": true,
                "color": "blue",
                "currentPopulation": 9883640,
                "history": [
                    {
                        "year": 1910,
                        "population": 2810
                    },
                    {
                        "year": 1920,
                        "population": 3668
                    },
                    {
                        "year": 1930,
                        "population": 4842
                    },
                    {
                        "year": 1940,
                        "population": 5256
                    },
                    {
                        "year": 1950,
                        "population": 6371
                    },
                    {
                        "year": 1960,
                        "population": 7823
                    },
                    {
                        "year": 1970,
                        "population": 8875
                    },
                    {
                        "year": 1980,
                        "population": 9262
                    },
                    {
                        "year": 1990,
                        "population": 9295
                    },
                    {
                        "year": 2000,
                        "population": 9938
                    },
                    {
                        "year": 2010,
                        "population": 9883
                    }
                ]
            },
            {
                "name": "Texas",
                "show": true,
                "color": "green",
                "currentPopulation": 25145561,
                "history": [
                    {
                        "year": 1910,
                        "population": 3896
                    },
                    {
                        "year": 1920,
                        "population": 4663
                    },
                    {
                        "year": 1930,
                        "population": 5824
                    },
                    {
                        "year": 1940,
                        "population": 6414
                    },
                    {
                        "year": 1950,
                        "population": 7711
                    },
                    {
                        "year": 1960,
                        "population": 9579
                    },
                    {
                        "year": 1970,
                        "population": 1119
                    },
                    {
                        "year": 1980,
                        "population": 1422
                    },
                    {
                        "year": 1990,
                        "population": 1698
                    },
                    {
                        "year": 2000,
                        "population": 2085
                    },
                    {
                        "year": 2010,
                        "population": 2514
                    }
                ]
            }
        ];
        const xData = data[0].history.map(d => d.year);
        // Define the scales and tell D3 how to draw the line
        const x = d3.scaleLinear().domain([xData[0], xData[xData.length - 1]]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 10000]).range([height, 0]);
        const line = d3.line().x(d => x(d.year)).y(d => y(d.population));

        const chart = d3.select('svg').append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const tooltip = d3.select('#tooltip_new');
        const tooltipLine = chart.append('line');

        // Add the axes and a title
        const xAxis = d3.axisBottom(x).tickFormat(d3.format('.4'));
        const yAxis = d3.axisLeft(y).tickFormat(d3.format('.2s'));
        chart.append('g').call(yAxis);
        chart.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis);
        chart.append('text').html('State Population Over Time').attr('x', 200);

        // Load the data and draw a chart
        let tipBox;

        chart.selectAll()
            .data(data).enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', d => d.color)
            .attr('stroke-width', 2)
            .datum(d => d.history)
            .attr('d', line);

        chart.selectAll()
            .data(data).enter()
            .append('text')
            .html(d => d.name)
            .attr('fill', d => d.color)
            .attr('alignment-baseline', 'middle')
            .attr('x', width)
            .attr('dx', '.5em')
            .attr('y', d => y(d.currentPopulation));

        tipBox = chart.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)
            .on('mousemove', drawTooltip)
            .on('mouseout', removeTooltip);
        // });

        function removeTooltip() {
            if (tooltip) tooltip.style('display', 'none');
            if (tooltipLine) tooltipLine.attr('stroke', 'none');
        }

        function drawTooltip() {
            const year = Math.floor((x.invert(d3.mouse(tipBox.node())[0]) + 5) / 10) * 10;

            data.sort((a, b) => {
                return b.history.find(h => h.year == year).population - a.history.find(h => h.year == year).population;
            })

            tooltipLine.attr('stroke', 'black')
                .attr('x1', x(year))
                .attr('x2', x(year))
                .attr('y1', 0)
                .attr('y2', height);

            tooltip.html(year)
                .style('display', 'block')
                .style('left', d3.event.pageX + 20)
                .style('top', d3.event.pageY - 20)
                .selectAll()
                .data(data).enter()
                .append('div')
                .style('color', d => d.color)
                .html(d => d.name + ': ' + d.history.find(h => h.year == year).population);
        }
    }
}
