import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, Renderer2 } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Goal, Contribution } from "../goal.model";
import { Asset, AssetType } from "../../assets/asset.model";
import { NgForm } from "@angular/forms";
import { CurrencyService } from "../../currency/currency.service";

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

  assetGroupMap: Map<AssetType, number> = new Map();
  assetGroupIds: Map<AssetType, Asset[]> = new Map();
  assetGroupsInScope: AssetType[] = [];
  assetToggleMap: Map<AssetType, boolean> = new Map();
  allAssetvalueMap: Map<string, number> = new Map();
  sliderAssetValues;

  @ViewChild("f", { static: true }) form: NgForm;
  temp : number =0;
  fuckOff = 30;
  changeFuck() {
    this.fuckOff= 45;
    console.log(document.getElementById("fuckOff"))
  }

  constructor(private modalCtrl: ModalController, public currencyService: CurrencyService, private renderer : Renderer2, private element: ElementRef) {}

  ngOnInit() {
    
    let allAssets: Asset[] = [];
    if (this.assets) {
      allAssets = allAssets.concat(this.assets);
    }
    if (this.remainingAssets) {
      allAssets = allAssets.concat(this.remainingAssets)
    }
    
    this.assetValueMap.clear();
    this.allAssetvalueMap.clear();
    this.assetContributionMap.forEach((value, key) => {
      this.assetValueMap.set(
        key,
        value / this.contributions.find((c) => c.assetId === key && c.goalId === this.goal.id).percentageContribution
      );
      this.allAssetvalueMap.set(key,
        value / this.contributions.find((c) => c.assetId === key && c.goalId === this.goal.id).percentageContribution);
    });
    if (this.remainingAssetValueMap) {
      this.remainingAssetValueMap.forEach((val,key) => this.allAssetvalueMap.set(key, val));
    }
    this.assetGroupMap.clear();
    this.assetGroupIds.clear();
    allAssets.forEach(asset => {
      let assetVal: number = 0;
        if (this.assetValueMap.has(asset.id)) {
          assetVal = this.assetValueMap.get(asset.id)
        }
        if (this.remainingAssetValueMap.has(asset.id)) {
          assetVal = this.remainingAssetValueMap.get(asset.id)
        }
      if (this.assetGroupMap.has(asset.assetType)) {
        this.assetGroupMap.set(asset.assetType, this.assetGroupMap.get(asset.assetType) + assetVal);
        this.assetGroupIds.get(asset.assetType).push(asset);
      } else {
        this.assetGroupMap.set(asset.assetType, assetVal);
        this.assetGroupIds.set(asset.assetType, [asset]);
      }
    })
    this.assetGroupsInScope = Array.from(this.assetGroupMap.keys());
    this.assetToggleMap.clear();
    Array.from(this.assetGroupMap.keys()).forEach(ag => this.assetToggleMap.set(ag, false));
    this.sliderAssetValues = {};
    allAssets.forEach(asset => {
      if (this.assetContributionMap.has(asset.id)) {
        this.sliderAssetValues[asset.id] = this.assetContributionMap.get(asset.id);
      } else {
        this.sliderAssetValues[asset.id] = 0;
      }
    })
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }

  onChangeSlider(asset: Asset, slider) {
    let maxPerc: number = asset.percentUnallocated + (this.assetContributionPercentage(asset.id) / 100.0);
    let assetValue;
    let contributingAmountBefore: number = this.totalContributionAmountExceptAsset(asset);
    if (this.assetValueMap && this.assetValueMap.has(asset.id)) {
      assetValue = this.assetValueMap.get(asset.id) * maxPerc;
    } else if (this.remainingAssetValueMap && this.remainingAssetValueMap.has(asset.id)) {
      assetValue = this.remainingAssetValueMap.get(asset.id) * maxPerc;
    }
    // min(slider value, max amount the asset can contribute, max amount reqd)
    this.temp = 0;
    console.log(asset.id, this.sliderAssetValues[asset.id], assetValue, this.goal.amountReqd - contributingAmountBefore, Math.min(this.sliderAssetValues[asset.id], assetValue, this.goal.amountReqd - contributingAmountBefore))
    this.sliderAssetValues[asset.id]  = Math.min(slider["el"].value, assetValue, this.goal.amountReqd - contributingAmountBefore);
    this.sliderAssetValues = {...this.sliderAssetValues};
    let item = this.renderer.selectRootElement(`[name="value-${asset.id}"]`);
    console.log(item)
    console.log(slider)
    //slider["el"].value = Math.min(slider["el"].value, assetValue, this.goal.amountReqd - contributingAmountBefore);
  }

  onChangeGroupSlider(assetType: AssetType) {
    console.log('hello2')
    let item = this.renderer.selectRootElement(`[name="group-${assetType}"]`)
    console.log(item.value)
    this.renderer.setProperty(item, "value", 0);
    console.log(item.value)
  }

  onSubmit() {
    if (this.form.invalid || this.form.pristine) {
      this.modalCtrl.dismiss(null, "cancel");
    }
    let contributingAssets: Asset[] = [];
    let nonContributingAssets: Asset[] = [];
    let contributions: Contribution[] = [...this.contributions];
    this.assets.forEach((asset) => {
      let contribution = contributions.find((c) => c.assetId === asset.id && c.goalId === this.goal.id);
      if (this.isAssetContributing(asset.id)) {
        let newPerc: number = this.form.value[`value-${asset.id}`] / this.assetValueMap.get(asset.id);
        if (newPerc !== contribution.percentageContribution) {
          asset.percentUnallocated = asset.percentUnallocated + contribution.percentageContribution - newPerc;
          // update the contribution
          contribution.percentageContribution = newPerc;
        }
        contributingAssets.push(asset);
      } else {
        // remove this assets percentage allocation of the goal from the asset object
        asset.percentUnallocated += contribution.percentageContribution;
        // remove the asset from the contributions list as well
        contributions = contributions.filter((c) => c.id !== contribution.id);
        nonContributingAssets.push(asset);
      }
    });
    this.remainingAssets.forEach((asset) => {
      if (this.isAssetContributing(asset.id)) {
        let newPerc: number = this.form.value[`value-${asset.id}`] / this.remainingAssetValueMap.get(asset.id);
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
    let contribution = 100 * this.contributions.find((c) => c.assetId === assetId && c.goalId === this.goal.id)?.percentageContribution;
    return contribution ? contribution : 0;
  }

  assetContributionValue(assetId: string) {
    let contribution =  (this.assetContributionPercentage(assetId) / 100) * this.assetValueMap.get(assetId);
    return contribution ? contribution : 0;
  }

  isAssetContributing(assetId: string) {
    return (
      `value-${assetId}` in this.form.value &&
      this.form.value[`value-${assetId}`] > 0
    );
  }

  get totalContributionAmount() {
    let amount: number = 0;
    Object.keys(this.form.value).forEach(key => {
      if (key.startsWith('group')) {
        amount += this.form.value[key]
      }
    })
    // let contributingAmount = (asset, valueMap) => {
    //   if (this.isAssetContributing(asset.id)) {
    //     let contributingAssetValue = this.form.value[`value-${asset.id}`];
    //     amount += contributingAssetValue;
    //   }
    // };
    // this.assets.forEach((asset) => contributingAmount(asset, this.assetValueMap));
    // this.remainingAssets.forEach((asset) => contributingAmount(asset, this.remainingAssetValueMap));
    return amount;
  }

  totalContributionAmountExceptAsset(removedAsset: Asset) {
    let amount: number = 0;
    let contributingAmount = (asset, valueMap) => {
      if (!(removedAsset.id === asset.id) && this.isAssetContributing(asset.id)) {
        let contributingAssetValue = this.form.value[`value-${asset.id}`];
        amount += contributingAssetValue;
      }
    };
    this.assets.forEach((asset) => contributingAmount(asset, this.assetValueMap));
    this.remainingAssets.forEach((asset) => contributingAmount(asset, this.remainingAssetValueMap));
    return amount;
  }

  toggleView(ag: AssetType) {
    this.assetToggleMap.set(ag, !this.assetToggleMap.get(ag));
  }

  displayTickValue(asset) {
    // let val = 100 * (this.allAssetvalueMap.get(asset.id) * asset.percentUnallocated 
    // +
    // this.assetContributionMap.get(asset.id)) / this.allAssetvalueMap.get(asset.id);
    let assetVal = this.allAssetvalueMap.get(asset.id)
    let contribution = 0;
    if (this.assetContributionMap.has(asset.id)) {
      contribution = this.assetContributionMap.get(asset.id);
    }
    let val = assetVal* asset.percentUnallocated + contribution;
    val = 100*val/assetVal;
    return val;
  }

  displayTick(asset) {
    if (asset.percentUnallocated === 1) {
      return false;
    }
    let percent = asset.percentUnallocated;
    percent += (this.assetContributionMap.has(asset.id) ? this.assetContributionMap.get(asset.id) / this.allAssetvalueMap.get(asset.id): 0);
    return percent < (1 - 0.0001);

  }

  assetGroupCurrentValue(ag: AssetType) {
    if (!this.assetGroupIds.has(ag)) {
      return 0;
    }
    let val = 0;
    this.assetGroupIds.get(ag).forEach(asset => {
      if (this.assetContributionMap.has(asset.id)) {
        val += this.assetContributionMap.get(asset.id)
      }
    });
    return val;
  }

  ngOnDestroy() {}
}
