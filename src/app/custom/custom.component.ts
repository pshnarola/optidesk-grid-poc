import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { SharedService } from '../shared/services/shared.service';

@Component({
    selector: 'app-custom',
    templateUrl: './custom.component.html',
    styleUrls: ['./custom.component.scss']
})
export class CustomComponent implements OnInit {
    planRowsConfig = [];
    columnConfig = [];
    tableDetails: any;
    dataset = [];
    pshDataSet = {};
    chartData = [];
    loadData = false;
    constructor(
        private shared: SharedService
    ) { }

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData() {
        Promise.all([
            this.shared.getPlanDates(),
            this.shared.getKeyFigures()
        ]).then(res => {
            this.columnConfig = res[0];
            this.planRowsConfig = res[1];
            this.columnConfig.unshift({ planDate: 'Key Figure' });
        });
    }

    loadPlanViewData() {
        this.loadData = false;
        this.shared.getPlanView().then(response => {
            this.tableDetails = response;
            this.generateRowData();
        }).catch(error => {
        });
    }

    generateRowData() {
        this.chartData = [];
        this.tableDetails.forEach(element => {
            if (!this.pshDataSet.hasOwnProperty(element.planDate)) {
                this.pshDataSet[element.planDate] = {};
            }
            this.pshDataSet[element.planDate].timescale = element.planDate;
            this.pshDataSet[element.planDate][element.keyFig] = element.quantity;
            this.chartData.push(this.pshDataSet[element.planDate]);
        });
        this.loadData = true;
        this.generateLineChart();
        this.multipleChart();
    }

    multipleChart() {
        console.log('chartData', this.chartData);
        // const data = this.chartData;
        const dataset = [
            ['A', 703, 1902],
            ['B', 1473, 3341],
            ['C', 863, 1935],
            ['D', 1494, 3008],
            ['E', 965, 1743],
            ['F', 568, 1271],
            ['G', 189, 626],
            ['H', 464, 1064],
            ['I', 731, 1443],
            ['J', 306, 630],
            ['K', 899, 2556],
            ['L', 231, 880],
            ['M', 262, 589],
            ['N', 429, 1497],
            ['O', 322, 749],
            ['P', 315, 720],
            ['Q', 228, 522],
            ['R', 436, 1391],
            ['S', 287, 613],
            ['T', 419, 932],
            ['U', 296, 612],
            ['V', 343, 855]
        ];
        // tslint:disable-next-line:one-variable-per-declaration
        const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960,
            height = 400;

        const xScale = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1)
            .domain(dataset.map((d) => {
                return d[0];
            }));
        const yScale = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(dataset, ((d) => {
                return d[2];
            }))]);

        const svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // axis-x
        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale));

        // axis-y
        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(yScale));

        const bar = g.selectAll('rect')
            .data(dataset)
            .enter().append('g');

        // bar chart
        bar.append('rect')
            .attr('x', (d) => xScale(d[0]))
            .attr('y', (d) => yScale(d[2]))
            .attr('width', xScale.bandwidth())
            .attr('height', (d) => height - yScale(d[2]))
            .attr('class', (d) => {
                const s = 'bar ';
                if (d[1] < 400) {
                    return s + 'bar1';
                } else if (d[1] < 800) {
                    return s + 'bar2';
                } else {
                    return s + 'bar3';
                }
            });

        // labels on the bar chart
        bar.append('text')
            .attr('dy', '1.3em')
            .attr('x', (d) => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d[2]))
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '11px')
            .attr('fill', 'black')
            .text((d) => {
                return d[2];
            });

        // line chart
        const line = d3.line()
            .x( (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
            .y( (d) => yScale(d[1]))
            .curve(d3.curveMonotoneX);

        bar.append('path')
            .attr('class', 'line') // Assign a class for styling
            .attr('d', line(dataset)); // 11. Calls the line generator

        bar.append('circle') // Uses the enter().append() method
            .attr('class', 'dot') // Assign a class for styling
            .attr('cx',  (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr('cy',  (d) => yScale(d[1]))
            .attr('r', 5);
    }

    generateLineChart() {
        const data = this.chartData;
        const trendsText = {
            depDemand: 'Dependent Demand',
            indDemand: 'Independent Demand',
            totDemand: 'Total Demand'
        };
        d3.selectAll('path.line').remove();
        d3.selectAll('circle').remove();
        d3.selectAll('text').remove();

        const margin = { top: 20, right: 80, bottom: 150, left: 50 };
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
        const ignoreScale = ['timescale', 'totDemand'];
        z.domain(d3.keys(this.chartData[0]).filter(key => {
            return ignoreScale.indexOf(key) === -1;
        }));

        const trends = z.domain().map(name => {
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
        const maxY = d3.max(trends, c => {
            return d3.max(c.values, v => {
                return v.total;
            });
        });
        y.domain([0, Math.ceil(maxY / 100) * 100]);

        // Draw the legend
        const legend = g.selectAll('g')
            .data(trends)
            .enter()
            .append('g')
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', (d, i) => (i) * 220)
            .attr('y', (d, i) => height + 70)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', d => z(d.name));

        legend.append('text')
            .attr('x', (d, i) => (i) * 220 + 20)
            .attr('y', (d, i) => height + 70 + 10)
            .text((d) => trendsText[d.name]);

        const bar = g.selectAll('rect')
            .data(this.chartData)
            .enter().append('g');

        // bar chart
        bar.append('rect')
            .attr('x', (d) => x(d.timescale) - 15)
            .attr('y', (d) => y(d.totDemand))
            .attr('width', 30)
            .attr('height', (d) => height - y(d.totDemand))
            .attr('class', (d) => {
                const s = 'bar ';
                if (d[1] < 400) {
                    return s + 'bar1';
                } else if (d[1] < 800) {
                    return s + 'bar2';
                } else {
                    return s + 'bar3';
                }
            });

        // labels on the bar chart
        bar.append('text')
            .attr('dy', '1.3em')
            .attr('x', (d) => x(d.timescale) + x.bandwidth() / 2)
            .attr('y', (d) => y(d.totDemand))
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '11px')
            .attr('fill', 'black')
            .text((d) => {
                return d.totDemand;
            });


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
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('y', 10)
            .attr('x', -60)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'start');

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

    onBlurMethod(row, column) {
        const planDate = column.planDate;
        const tempArray = [{ planDate, keyFig: row.keyFig, quantity: Number(this.pshDataSet[planDate][row.keyFig]) }];
        this.shared.updatePlanData(tempArray).then(res => {
            res.forEach(response => {
                this.tableDetails.forEach(details => {
                    if (response.planDate === details.planDate && response.keyFig === details.keyFig) {
                        details.quantity = response.quantity;
                    }
                });
            });
            this.generateRowData();
        }).catch(error => {
        });
        this.generateLineChart();
    }

}
