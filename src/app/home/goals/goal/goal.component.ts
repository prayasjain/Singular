import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss'],
})
export class GoalComponent implements OnInit {

  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;
  @Input() idNumber: any;
  constructor() {}

  ngOnInit() {}



  //  Utkarsh
  hc = 50;
  wc = 80;
  height = 50;
  width = 80;

  test(event) {
    if (event.detail.ratio > 0.3 && event.detail.ratio < 0.5) {
      this.height = this.hc + 41.6 * event.detail.ratio;
      this.width = this.wc + 11.33 * event.detail.ratio;
    }
    if (event.detail.ratio < 0.3) {
      this.height = 50;
      this.width = 80;
    }
  }

  cancel(id) {
    const track = '#item' + id;
    document.querySelector('ion-item-sliding').closeOpened();
  }

  delete(id) {
    const track = '#item' + id;
    document.querySelector(track).classList.add('remove');
  }
  // Utkarsh end
}
