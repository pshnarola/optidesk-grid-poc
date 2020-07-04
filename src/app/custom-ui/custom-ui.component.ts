import { Component, OnInit } from '@angular/core';
import { PLAN_ROWS } from '../custom/plan.config';
import * as d3 from 'd3';
import { SharedService } from '../shared/services/shared.service';

@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss']
})
export class CustomUiComponent implements OnInit {
  planRowsConfig = PLAN_ROWS;
  columnConfig: any;
  tableDetails: any;
  pshDataSet = {};
  chartData = [];
  planDate: any;
  rowLabel: any;

  constructor(
    private shared: SharedService
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    return await Promise.all([
      this.shared.getPlanDates(),
      this.shared.getKeyFigures()
    ]).then(res => {
      this.columnConfig = res[0];
      this.columnConfig.unshift({ planDate: 'Key Figure' });
    })
  }

  isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }

    return true;
    // return Object.keys(obj).length === 0;
  }

  loadPlanViewData() {
    this.shared.getPlanView().then(response => {
      this.tableDetails = response;
      this.generateRowData();
    }).catch(error => {
    });
  }

  generateRowData() {
    this.tableDetails.forEach(element => {
      if (!this.pshDataSet.hasOwnProperty(element.planDate)) {
        this.pshDataSet[element.planDate] = {};
        this.chartData.push(this.pshDataSet[element.planDate]);
      }
      this.pshDataSet[element.planDate]['timescale'] = element.planDate;
      this.pshDataSet[element.planDate][element.keyFig] = element.quantity;
    });
    this.generateLineChart();
  }

  generateLineChart() {
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
      .attr('y', (d, i) => height + 70)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', d => z(d.name));

    legend.append('text')
      .attr('x', (d, i) => (i) * 220 + 20)
      .attr('y', (d, i) => height + 70 + 10)
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
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("y", 10)
      .attr("x", -60)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "start");

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
    this.planDate = column['planDate']
    this.rowLabel = this.planRowsConfig[rowIndex];
    if (this.pshDataSet.hasOwnProperty(column['planDate'])) {
      this.pshDataSet[this.planDate][this.rowLabel.keyFig] = Number(this.pshDataSet[this.planDate][this.rowLabel.keyFig])
      this.pshDataSet[this.planDate]['totDemand'] = this.pshDataSet[this.planDate][this.rowLabel.keyFig] + this.pshDataSet[this.planDate]['depDemand']
    }
    this.generateLineChart();
  }

  updatePlanview() {
    const json = {
      'planDate': this.planDate,
      'keyFig': this.rowLabel.keyFig,
      'quantity': Number(this.pshDataSet[this.planDate][this.rowLabel.keyFig])
    }

    this.shared.updatePlanData(json).then(response => {
      response.forEach(response => {
        this.tableDetails.forEach(details => {
          if (response.planDate == details.planDate && response.keyFig == details.keyFig) {
            details['quantity'] = response.quantity;
          }
        });
      });
      this.generateRowData();
    }).catch(error => {
    });

  }

}
