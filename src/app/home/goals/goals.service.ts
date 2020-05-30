import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Goal, Contribution } from "./goal.model";
import { take, tap, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class GoalsService {
  private _userGoals = new BehaviorSubject<Goal[]>([
    new Goal("1", "Trip to Bali!", 15000, new Date()),
    new Goal("2", "IPhone 12", 1000, new Date()),
  ]);
  private _userGoalsContributions = new BehaviorSubject<Contribution[]>([
    new Contribution("1", "3", "1", 0.2),
    new Contribution("2", "4", "1", 0.4),
    new Contribution("3", "1", "2", 0.2),
    new Contribution("4", "2", "2", 0.3),
  ]);

  constructor() {}

  get userGoals() {
    return this._userGoals.asObservable();
  }

  get userGoalsContributions() {
    return this._userGoalsContributions.asObservable();
  }

  getUserGoalsContributionforGoal(goalId: string) {
    return this._userGoalsContributions.asObservable().pipe(
      map((userGoalsContributions) => {
        return userGoalsContributions.filter(
          (userGoalsContribution) => userGoalsContribution.goalId === goalId
        );
      })
    );
  }

  addUserGoal(goal: Goal) {
    return this.userGoals.pipe(
      take(1),
      tap((userGoals) => {
        this._userGoals.next(userGoals.concat(goal));
      })
    );
  }
}
