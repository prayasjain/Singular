import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cashflow-detail',
  templateUrl: './cashflow-detail.page.html',
  styleUrls: ['./cashflow-detail.page.scss'],
})
export class CashflowDetailPage implements OnInit {
  title: string = "title";

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      let assetId = paramMap.get('cashflowId');
      if (assetId === '2') {
        this.title = "Payables";
      }
      if (assetId === '1') {
        this.title = "Receivables";
      }
    });
  }

}
