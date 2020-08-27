import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js';
import { Constants } from 'src/app/config/constants';
import { AssetsService } from 'src/app/home/assets/assets.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit {
  constants = Constants;
  selectedGraphType;
  colorArray: any;
  graphData;
  canvas: any;
  ctx: any;
  myChart;
  @ViewChild('mychart', { static: true }) mychart: ElementRef<HTMLElement>;
  constructor(private readonly assetsService: AssetsService) { }

  ngOnInit() {
    this.getAssetHistory();

  }

  getAssetHistory(filter?) {
    this.assetsService.getAssetHistory('all', filter ? filter : Constants.FILTER_OPTIONS.YEARLY).subscribe((data) => {
      this.graphData = data;
      this.createBarChart(this.graphData);
    });
  }


  createBarChart(graphData) {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    this.myChart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: this.graphData?.labels,
        datasets: [{
          label: 'Assets Networth',
          data: this.graphData?.data,
          backgroundColor: 'rgb(204, 214, 249)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(197, 210, 254)', // array should have same number of elements as number of dataset
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
    this.selectedGraphType = type;
    // this.createBarChart(Constants.GRAPH_FILTER_OPTIONS[type].labels, Constants.GRAPH_FILTER_OPTIONS[type].data);
    this.getAssetHistory(this.selectedGraphType);
  }
}


