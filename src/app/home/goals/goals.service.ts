import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Goal, Contribution } from "./goal.model";
import { take, tap, map, switchMap } from "rxjs/operators";
import { AssetsService } from "../assets/assets.service";

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

  constructor(private assetsService: AssetsService) {}

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

  addUserGoalsContribution(contribution: Contribution) {
    return this.assetsService
      .updateAssetAllocation(
        contribution.assetId,
        contribution.percentageContribution
      )
      .pipe(
        take(1),
        switchMap((assets) => {
          return this.userGoalsContributions;
        }),
        take(1),
        tap((userGoalsContribution) => {
          this._userGoalsContributions.next(
            userGoalsContribution.concat(contribution)
          );
        })
      );
  }

  deleteGoal(goalId: string) {
    // delete all contributions for the goal
    return this.userGoalsContributions.pipe(
      take(1),
      switchMap((goalContributions) => {
        this._userGoalsContributions.next(
          goalContributions.filter(
            (contribution) => contribution.goalId === goalId
          )
        );
        return this.userGoals;
      }),
      take(1),
      // remove the goal
      tap((goals) => {
        console.log("deleting goal");
        this._userGoals.next(goals.filter((g) => g.id === goalId));
      })
    );
  }

  updateContributions(contributions: Contribution[], goalId: string) {
    return this.userGoalsContributions.pipe(
      take(1),
      map((oldContributions) => {
        return oldContributions
          .filter((c) => c.goalId !== goalId)
          .concat(contributions);
      }),
      tap(contributions => {
        this._userGoalsContributions.next(contributions);
      })
    );
  }
}
