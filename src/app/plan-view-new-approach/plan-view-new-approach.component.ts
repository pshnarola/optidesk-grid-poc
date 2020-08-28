import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';
import * as d3 from 'd3';

@Component({
    selector: 'app-plan-view-new-approach',
    templateUrl: './plan-view-new-approach.component.html',
    styleUrls: ['./plan-view-new-approach.component.scss']
})
export class PlanViewNewApproachComponent implements OnInit {
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
    }

    generateLineChart() {
        const data = this.chartData;
        const trendsText = {
            depDemand: 'Dependent Demand',
            indDemand: 'Independent Demand'
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
        const z = d3.scaleOrdinal(['#036888', '#0D833C']);


        // scale the range of the data
        z.domain(d3.keys(this.chartData[0]).filter(key => {
            return key !== 'timescale';
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
        const filterTrends = trends.filter((item) => {
            return item.name !== 'totDemand';
        });
        x.domain(this.chartData.map(d => d.timescale));
        const maxY = d3.max(filterTrends, (c, i) => {
            return d3.max(c.values, v => {
                return v.total;
            });
        });
        y.domain([0, Math.ceil(maxY / 100) * 100]);

        const xScale = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.map((d) => {
            return d.timescale;
        }));

        const yScale = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([0, d3.max(data, ((d) => {
                return d.totDemand;
            }))]);

        // axis-x
        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('y', 10)
            .attr('x', -60)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'start');

        // axis-y
        g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(yScale));

        const bar = g.selectAll('rect')
        .data(data)
        .enter().append('g');

        // bar chart
        bar.append('rect')
            .attr('x', (d) => xScale(d.timescale))
            .attr('y', (d) => yScale(d.totDemand))
            .attr('width', xScale.bandwidth())
            .attr('height', (d) => height - yScale(d.totDemand))
            .attr('class', 'bar')
            .style('opacity', 0.4);

        // labels on the bar chart
        bar.append('text')
            .attr('dy', '1.3em')
            .attr('x', (d) => xScale(d.timescale) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d.totDemand))
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '11px')
            .attr('fill', 'white')
            .text((d) => {
            return d.totDemand;
            });

        // line chart
        const line = d3.line()
            .x((d) =>  xScale(d.timescale))
            .y((d) => yScale(d.total))
            .curve(d3.curveMonotoneX);

        bar.append('path')
        .data(filterTrends)
            .attr('class', 'line') // Assign a class for styling
            .attr('d', d => line(d.values))
            .style('stroke', d => z(d.name)); // 11. Calls the line generator

        filterTrends.forEach(tren => {
            bar.append('circle')
            .style('fill', d => z(d[tren.name]))
            .style('stroke', d => z(d[tren.name]))
            .attr('class', 'dot')
            .attr('cx', (d, i) => {
                return xScale(d.timescale);
            })
            .attr('cy', (d) => {
                return yScale(d[tren.name]);
            })
            .attr('r', 5)
            .style('stroke-width', 3);
        });

        // Draw the legend
        const legend = bar.selectAll('g')
            .data(filterTrends)
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

        const focus = bar.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('y1', 0)
            .attr('y2', height);

        svg.append('bar')
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
