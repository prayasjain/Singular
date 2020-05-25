import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cashflow',
  templateUrl: './cashflow.component.html',
  styleUrls: ['./cashflow.component.scss'],
})
export class CashflowComponent implements OnInit {
  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;

  constructor() { }

  ngOnInit() {}

  onItemClick() {}

}
