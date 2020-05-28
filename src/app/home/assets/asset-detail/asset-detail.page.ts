import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.page.html',
  styleUrls: ['./asset-detail.page.scss'],
})
export class AssetDetailPage implements OnInit {

  title: string = "title";

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      let assetId = paramMap.get('assetId');
      if (assetId === '1') {
        this.title = "Savings Account";
      }
      if (assetId === '2') {
        this.title = "Deposits";
      }
      if (assetId === '3') {
        this.title = "Mutual funds";
      }
      if (assetId === '4') {
        this.title = "Equities";
      }
      if (assetId === '5') {
        this.title = "Cash";
      }
    });
  }

}
