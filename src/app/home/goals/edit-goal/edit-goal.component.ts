import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Goal, Contribution } from "../goal.model";
import { Asset } from "../../assets/asset.model";
import { NgForm } from "@angular/forms";
import { CurrencyService } from "../../currency/currency.service";
import { take, switchMap } from "rxjs/operators";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-goal",
  templateUrl: "./edit-goal.component.html",
  styleUrls: ["./edit-goal.component.scss"],
})
export class EditGoalComponent implements OnInit, OnDestroy {
  @Input() goal: Goal;
  @Input() contributions: Contribution[];
  // allocated assets
  @Input() assets: Asset[];
  // unallocated assets
  @Input() remainingAssets: Asset[];
  // contribution of allocated assets
  @Input() assetContributionMap: Map<string, number>;
  // value of unallocated assets
  @Input() remainingAssetValueMap: Map<string, number>;
  // value of allocated assets
  assetValueMap: Map<string, number> = new Map();

  @ViewChild("f", { static: true }) form: NgForm;
  //@ViewChild("slider", { static: false }) listContainer: Element;
  //@ViewChild("sliderRange", { static: false }) slider: Element;

  constructor(private modalCtrl: ModalController, public currencyService: CurrencyService) {}

  ngOnInit() {
    this.assetValueMap.clear();
    this.assetContributionMap.forEach((value, key) => {
      this.assetValueMap.set(
        key,
        value / this.contributions.find((c) => c.assetId === key && c.goalId === this.goal.id).percentageContribution
      );
    });
  }

  onchangeInput(asset, i, slider) {
    // if(this.listContainer['el'].value > (100 * asset.percentUnallocated)) {
    //   this.listContainer['el'].value = 100 * asset.percentUnallocated;
    // }
    // codes updated to give the range slider a defenite value
    let assetValue;
    if (this.assetValueMap && this.assetValueMap.has(asset.id)) {
      assetValue = this.assetValueMap.get(asset.id) * asset.percentUnallocated;
    } else if (this.remainingAssetValueMap && this.remainingAssetValueMap.has(asset.id)) {
      assetValue = this.remainingAssetValueMap.get(asset.id) * asset.percentUnallocated;
    }
    if (slider["el"].value > assetValue) {
      slider["el"].value = assetValue;
    }
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }

  onChangeSliderValue(asset, slider) {
    if (slider["el"].value > this.assetContributionPercentage(asset.id) + 100 * asset.percentUnallocated) {
      slider["el"].value = this.assetContributionPercentage(asset.id) + 100 * asset.percentUnallocated;
    }
  }

  onSubmit() {
    if (this.form.invalid || this.form.pristine) {
      this.modalCtrl.dismiss(null, "cancel");
    }
    let contributingAssets: Asset[] = [];
    let nonContributingAssets: Asset[] = [];
    let contributions: Contribution[] = [...this.contributions];
    //form value is not percentage but absolute. todo change form name
    this.assets.forEach((asset) => {
      let contribution = contributions.find((c) => c.assetId === asset.id && c.goalId === this.goal.id);
      if (this.isAssetContributing(asset.id)) {
        let newPerc: number = this.form.value[`percentage-${asset.id}`] / this.assetValueMap.get(asset.id);
        if (newPerc !== contribution.percentageContribution) {
          asset.percentUnallocated = asset.percentUnallocated + contribution.percentageContribution - newPerc;
          // update the contribution
          contribution.percentageContribution = newPerc;
        }
        contributingAssets.push(asset);
      } else {
        // remove this assets percentage allocation of the goal from the asset object
        asset.percentUnallocated -= contribution.percentageContribution;
        // remove the asset from the contributions list as well
        contributions = contributions.filter((c) => c.id !== contribution.id);
        nonContributingAssets.push(asset);
      }
    });
    this.remainingAssets.forEach((asset) => {
      if (this.isAssetContributing(asset.id)) {
        let newPerc: number = this.form.value[`percentage-${asset.id}`] / this.remainingAssetValueMap.get(asset.id);
        asset.percentUnallocated -= newPerc;
        // edit the asset
        contributingAssets.push(asset);
        // add new contribution
        contributions.push(new Contribution(Math.random().toString(), asset.id, this.goal.id, newPerc));
      } else {
        nonContributingAssets.push(asset);
      }
    });
    this.modalCtrl.dismiss(
      {
        contributingAssets: contributingAssets,
        nonContributingAssets: nonContributingAssets,
        contributions: contributions,
      },
      "confirm"
    );
  }

  assetContributionPercentage(assetId: string) {
    return 100 * this.contributions.find((c) => c.assetId === assetId && c.goalId === this.goal.id).percentageContribution;
  }

  isAssetContributing(assetId: string) {
    return (
      `checkbox-${assetId}` in this.form.value &&
      this.form.value[`checkbox-${assetId}`] &&
      `percentage-${assetId}` in this.form.value &&
      this.form.value[`percentage-${assetId}`] > 0
    );
  }

  get totalContributionAmount() {
    let amount: number = 0;
    let contributingAmount = (asset, valueMap) => {
      if (this.isAssetContributing(asset.id)) {
        let contributingPerc = this.form.value[`percentage-${asset.id}`];
        amount += contributingPerc;
        // amount += (contributingPerc * valueMap.get(asset.id)) / 100;
      }
    };
    this.assets.forEach((asset) => contributingAmount(asset, this.assetValueMap));
    this.remainingAssets.forEach((asset) => contributingAmount(asset, this.remainingAssetValueMap));
    return amount;
  }

  ngOnDestroy() {}
}
