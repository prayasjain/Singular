import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js';
import { Constants } from 'src/app/config/constants';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit {
  constants = Constants;
  colorArray: any;
  canvas: any;
  ctx: any;
  myChart;
  @ViewChild('mychart', { static: true }) mychart: ElementRef<HTMLElement>;
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.createBarChart();
  }


  createBarChart(labels?, data?) {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    this.myChart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: labels || this.constants.GRAPH_FILTER_OPTIONS.YEARLY.labels,
        datasets: [{
          data: data || this.constants.GRAPH_FILTER_OPTIONS.YEARLY.data,
          backgroundColor: 'rgba(240, 240, 240, 1)', // array should have same number of elements as number of dataset
          borderColor: 'rgba(240, 194, 129, 1)', // array should have same number of elements as number of dataset
        }]
      },
      options: { 
      responsive: true,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: true,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
            },
          },
        ],
      }
    },
    });
  }

  dataByFilter(type) {
    this.createBarChart(Constants.GRAPH_FILTER_OPTIONS[type].labels, Constants.GRAPH_FILTER_OPTIONS[type].data);
   }
}


