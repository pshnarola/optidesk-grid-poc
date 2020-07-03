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
    chartData = [];
    constructor() { }

    ngOnInit(): void {
        this.generateRowData();
        this.generateLineChart();
    }

    generateRowData() {
        const result = this.tableDetails.reduce(function (r, a) {
            r[a.planDate] = r[a.planDate] || [];
            r[a.planDate].push(a);
            return r;
        }, Object.create(null));

        this.dataset = result;
        this.tableDetails.forEach(element => {
            if (!this.pshDataSet.hasOwnProperty(element.planDate)) {
                this.pshDataSet[element.planDate] = {};
                this.chartData.push(this.pshDataSet[element.planDate]);
            }
            this.pshDataSet[element.planDate]['timescale'] = element.planDate;
            this.pshDataSet[element.planDate][element.keyFig] = element.quantity;
        });
    }

    generateLineChart() {
        console.log('chart data', this.chartData)
        const data = this.chartData;
        const trendsText = {
            depDemand: 'Dependent Demand',
            indDemand: 'Independent Demand',
            totDemand: 'Total Demand'
        };
        d3.selectAll("path.line").remove();
        d3.selectAll("circle").remove();
        d3.selectAll("text").remove();

        // set the dimensions and margins of the graph
        const margin = { top: 20, right: 80, bottom: 50, left: 50 };
        const svg = d3.select('svg');
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;
        console.log('width', width);
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
        z.domain(d3.keys(this.chartData[0]).filter(key => {
            return key !== 'timescale';
        }));

        const trends = z.domain().map(name => {
            console.log('name', name);
            return {
                name,
                values: this.chartData.map(d => {
                    return {
                        timescale: d.timescale,
                        total: +d[name]
                    };
                })
            };
        });
        x.domain(this.chartData.map(d => d.timescale));
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
            .attr('x', (d, i) => (i) * 220)
            // .attr('y', (d, i) => height / 2 - (i + 1) * 20)
            .attr('y', (d, i) => height + 30)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', d => z(d.name));

        legend.append('text')
            .attr('x', (d, i) => (i) * 220 + 20)
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

        const timeScales = this.chartData.map(name => x(name.timescale));

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

    onBlurMethod(rowIndex, columnIndex, column) {
        const planDate = column['planDate']
        const rowLabel = this.planRowsConfig[rowIndex];
        if (this.pshDataSet.hasOwnProperty(column['planDate'])) {
            this.pshDataSet[planDate][rowLabel.keyFig] = Number(this.pshDataSet[planDate][rowLabel.keyFig])
            this.pshDataSet[planDate]['totDemand'] = this.pshDataSet[planDate][rowLabel.keyFig] + this.pshDataSet[planDate]['depDemand']
        }
        this.tableDetails.forEach(element => {
            if (element.planDate === planDate && element.keyFig === rowLabel.keyFig) {
            }
        });
        this.generateLineChart();
    }

    updatePlanview() {

    }

}
