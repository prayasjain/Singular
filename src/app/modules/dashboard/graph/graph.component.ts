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
  graphData = [];
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
      console.log(data);
      this.graphData = [];
      const graphValues = { data: data['data'] };
      if (graphValues?.data?.length) {
        while ((!filter || filter === Constants.FILTER_OPTIONS.YEARLY) && this?.graphData?.length !== 364) {
          this.graphData.push(0);
        }
        while ((filter === Constants.FILTER_OPTIONS.WEEKLY) && this?.graphData?.length !== 6) {
          this.graphData.push(0);
        }
        while ((filter === Constants.FILTER_OPTIONS.ONE_MONTH) && this?.graphData?.length !== 30) {
          this.graphData.push(0);
        }
        while ((filter === Constants.FILTER_OPTIONS.SIX_MONTHS) && this?.graphData?.length !== 120) {
          this.graphData.push(0);
        }
        this.createBarChart(this.graphData.concat(graphValues.data));
      }
    });
  }


  createBarChart(graphData) {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: graphData,
        datasets: [{
          label: 'Assets Networth',
          data: graphData,
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
                display: false,
              },
              ticks: {
                display: false,
              }
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
    this.getAssetHistory(this.selectedGraphType);
  }
}


