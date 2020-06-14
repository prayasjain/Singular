import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-assets-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent implements OnInit {

  @Input() title: string;
  @Input() content: string;
  @Input() value: number;
//  @Input() imgUrl: string;
  @Input() id: string;

  constructor() { }

  ngOnInit() {}

}
