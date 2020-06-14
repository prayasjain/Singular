import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
})
export class AssetComponent implements OnInit {

  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;

  constructor() { }

  ngOnInit() {
    if (!this.itemColor) {
      this.itemColor = "tertiary";
    }
  }

}
