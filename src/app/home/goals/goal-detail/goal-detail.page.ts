import { Component, OnInit } from "@angular/core";
import { Goal } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { Contribution } from '../../assets/asset.model';

@Component({
  selector: "app-goal-detail",
  templateUrl: "./goal-detail.page.html",
  styleUrls: ["./goal-detail.page.scss"],
})
export class GoalDetailPage implements OnInit {
  goal: Goal;
  contributions: Contribution[];
  finishPerc : number = 0.7;


  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let goalId = paramMap.get("goalId");
      this.contributions = [];
      if (goalId === "1") {
        this.goal = new Goal("1", "Bali Vacation", 10000);
        this.contributions.push(new Contribution("1","1","1",0.2));
        this.contributions.push(new Contribution("2","2","1",0.4));
      }
      if (goalId === "2") {
        this.goal = new Goal("2", "Buy the new Iphone 12", 1000);
        this.contributions.push(new Contribution("1","1","1",0.2));
        this.contributions.push(new Contribution("2","2","1",0.4));
      }
    });
  }
}
