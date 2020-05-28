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

  constructor() { }

  ngOnInit() {}
}
