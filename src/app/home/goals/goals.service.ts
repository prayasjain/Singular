import { Injectable } from "@angular/core";
import { BehaviorSubject, zip, of, Observable } from "rxjs";
import { Goal, Contribution } from "./goal.model";
import { take, tap, map, switchMap } from "rxjs/operators";
import { AssetsService } from "../assets/assets.service";
import { AuthService } from "src/app/auth/auth.service";
import { HttpClient } from "@angular/common/http";
import { Asset } from "../assets/asset.model";

@Injectable({
  providedIn: "root",
})
export class GoalsService {
  private _userGoals = new BehaviorSubject<Goal[]>([]);
  private _userGoalsContributions = new BehaviorSubject<Contribution[]>([]);
  private initializedGoals: boolean = false;
  private initializedContribution: boolean = false;

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  get userGoals() {
    if (!this.initializedGoals) {
      this.fetchUserGoals()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedGoals = true;
        });
    }
    return this._userGoals.asObservable();
  }

  get userGoalsContributions() {
    if (!this.initializedContribution) {
      this.fetchUserGoalsContributions()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedContribution = true;
        });
    }
    return this._userGoalsContributions.asObservable();
  }

  fetchUserGoals() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.get(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-goals.json?auth=${token}`
        );
      }),
      map((resData) => {
        let goals: Goal[] = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let goal = new Goal(
              key,
              data.name,
              data.amountReqd,
              new Date(data.creationDate)
            );
            goals.push(goal);
          }
        }
        return goals;
      }),
      tap((goals) => {
        this._userGoals.next(goals);
      })
    );
  }

  fetchUserGoalsContributions() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.get(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions.json?auth=${token}`
        );
      }),
      map((resData) => {
        let contributions: Contribution[] = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let contribution = new Contribution(
              key,
              data.assetId,
              data.goalId,
              data.percentageContribution
            );
            contributions.push(contribution);
          }
        }
        return contributions;
      }),
      tap((contributions) => {
        this._userGoalsContributions.next(contributions);
      })
    );
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
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        goal.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-goals.json?auth=${token}`,
          { ...goal, id: null }
        );
      }),
      take(1),
      switchMap((resData) => {
        goal.id = resData.name;
        return this.userGoals;
      }),
      take(1),
      tap((userGoals) => {
        this._userGoals.next(userGoals.concat(goal));
      }),
      map(() => {
        return goal;
      })
    );
  }

  addUserGoalsContribution(contribution: Contribution) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        contribution.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions.json?auth=${token}`,
          { ...contribution, id: null }
        );
      }),
      take(1),
      switchMap((resData) => {
        contribution.id = resData.name;
        return this.assetsService.updateAssetAllocation(
          contribution.assetId,
          contribution.percentageContribution
        );
      }),
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

  // note we are not updating user goals subject here as this is purely internal
  addUserGoalsContributionWithoutUpdateAsset(contribution: Contribution) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        contribution.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions.json?auth=${token}`,
          { ...contribution, id: null }
        );
      }),
      map((resData) => {
        contribution.id = resData.name;
        return contribution;
      })
    );
  }

  deleteGoal(goalId: string) {
    let auth;
    let authToken;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      switchMap((token) => {
        authToken = token;
        return this.deleteContributionsOfGoal(goalId);
      }),
      take(1),
      switchMap(() => {
        return this.http.delete(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-goals/${goalId}.json?auth=${authToken}`
        );
      }),
      switchMap(() => {
        return this.userGoals;
      }),
      take(1),
      switchMap((userGoals) => {
        if (!userGoals || userGoals.length <= 0) {
          return this.fetchUserGoals();
        }
        return of(userGoals);
      }),
      take(1),
      tap((goals) => {
        this._userGoals.next(goals.filter((g) => g.id !== goalId));
      })
    );
  }

  deleteContributionsOfGoal(goalId: string) {
    let auth;
    let authToken;
    let updatedContributions;
    let updatedAssets: Asset[] = [];
    let originalContributions: Contribution[];
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userGoalsContributions;
      }),
      take(1),
      switchMap((userGoalsContributions) => {
        if (!userGoalsContributions || userGoalsContributions.length <= 0) {
          return this.fetchUserGoalsContributions();
        }
        return of(userGoalsContributions);
      }),
      take(1),
      switchMap((goalContributions) => {
        originalContributions = goalContributions;
        return this.assetsService.userAssets;
      }),
      take(1),
      switchMap((userAssets) => {
        if (!userAssets || userAssets.length <= 0) {
          return this.assetsService.fetchUserAssets();
        }
        return of(userAssets);
      }),
      take(1),
      switchMap((userAssets: Asset[]) => {
        updatedContributions = originalContributions.filter(
          (contribution) => contribution.goalId !== goalId
        );
        let deletedContributions = originalContributions.filter(
          (c) => c.goalId === goalId
        );
        deletedContributions.forEach((c) => {
          let updAsset = userAssets.find((a) => a.id === c.assetId);
          updAsset.percentUnallocated += c.percentageContribution;
          updatedAssets.push(updAsset);
        });
        let contributionObservableList = updatedContributions.map((gc) => {
          return this.http.delete(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions/${gc.id}.json?auth=${authToken}`
          );
        });
        let assetObservableList = updatedAssets.map((a) => {
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${a.id}.json?auth=${authToken}`,
            { ...a, id: null }
          );
        });
        if (
          contributionObservableList.length + assetObservableList.length ===
          0
        ) {
          return of([]);
        }
        return zip(...contributionObservableList, ...assetObservableList);
      }),
      switchMap(() => {
        return this.assetsService.fetchUserAssets();
      }),
      tap(() => {
        this._userGoalsContributions.next(updatedContributions);
      })
    );
  }

  deleteContributionsOfAsset(assetId: string) {
    let auth;
    let authToken;
    let updatedContributions;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userGoalsContributions;
      }),
      take(1),
      switchMap((userGoalsContributions) => {
        if (!userGoalsContributions || userGoalsContributions.length <= 0) {
          return this.fetchUserGoalsContributions();
        }
        return of(userGoalsContributions);
      }),
      take(1),
      switchMap((goalContributions) => {
        updatedContributions = goalContributions.filter(
          (contribution) => contribution.assetId !== assetId
        );
        let observableList = updatedContributions.map((gc) => {
          return this.http.delete(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions/${gc.id}.json?auth=${authToken}`
          );
        });
        if (observableList.length === 0) {
          return of([]);
        }
        return zip(...observableList);
      }),
      tap(() => {
        this._userGoalsContributions.next(updatedContributions);
      })
    );
  }

  // there will be some new contributions, and some old contributions that are updated, and some contributions that are deleted!
  updateContributions(contributions: Contribution[], goalId: string) {
    let auth;
    let authToken;
    let newContributions: Contribution[] = []; // this just contains the new one (not updated or deleted)
    let deletedContributions: Contribution[] = [];
    let updatedContributions: Contribution[] = [];
    // all contributions (old) for all goals
    let oldAllContributions: Contribution[] = [];
    let oldIdsSet = new Set();
    let newIdsSet = new Set();
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userGoalsContributions;
      }),
      take(1),
      switchMap((oldContributions) => {
        oldAllContributions = oldContributions;
        // get contributions of the goal
        oldContributions = oldContributions.filter((c) => c.goalId === goalId);

        oldContributions.forEach((c) => oldIdsSet.add(c.id));
        contributions.forEach((c) => newIdsSet.add(c.id));
        deletedContributions = oldContributions.filter(
          (c) => !newIdsSet.has(c.id)
        );

        // we want the new copy of the updated contributions
        updatedContributions = contributions.filter((c) => oldIdsSet.has(c.id));
        // these are the new contributions
        let newContributionsObservableList: Observable<
          Contribution | Object
        >[] = contributions
          .filter((c) => !oldIdsSet.has(c.id))
          .map((gc) => {
            return this.addUserGoalsContributionWithoutUpdateAsset(gc).pipe(
              tap((contribution) => {
                newContributions.push(contribution as Contribution);
              })
            );
          });
        let deleteContributionsObservableList: Observable<
          Object
        >[] = deletedContributions.map((gc) => {
          return this.http.delete(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions/${gc.id}.json?auth=${authToken}`
          );
        });
        let updateContributionsObservableList: Observable<
          Object
        >[] = updatedContributions.map((gc) => {
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-contributions/${gc.id}.json?auth=${authToken}`,
            { ...gc, id: null }
          );
        });
        if (
          newContributionsObservableList.length +
            deleteContributionsObservableList.length +
            updateContributionsObservableList.length ===
          0
        ) {
          return of([]);
        } else {
          return zip(
            ...newContributionsObservableList,
            ...deleteContributionsObservableList,
            ...updateContributionsObservableList
          );
        }
      }),
      map((resData) => {
        return oldAllContributions
          .filter((oc) => oc.goalId !== goalId)
          .concat(newContributions)
          .concat(updatedContributions);
      }),
      tap((contributions) => {
        this._userGoalsContributions.next(contributions);
      })
    );
  }
}
