import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { Asset, SavingsAccount, AssetType } from "../home/assets/asset.model";
import { AssetsService } from "../home/assets/assets.service";
import { take, switchMap } from "rxjs/operators";
import { of, Observable, zip } from "rxjs";
import { LoadingController } from "@ionic/angular";
const { SMSPlugin } = Plugins;

@Injectable({
  providedIn: "root",
})
export class SmsService {
  constructor(
    private assetsService: AssetsService,
    private loadingCtrl: LoadingController
  ) {}

  async convertSMSToAccount() {
    let savingsAccounts: SavingsAccount[] = [];
    try {
      let data = await this.fetchSms(null, null, null);
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          let accountInfo = data[key];
          const savingAccount: SavingsAccount = new SavingsAccount(
            accountInfo["bankName"],
            +accountInfo["amount"],
            accountInfo["account"],
            new Date(accountInfo["date"])
          );
          savingsAccounts.push(savingAccount);
        }
      }
      if (savingsAccounts.length === 0) {
        return;
      }
      return savingsAccounts;
    } catch (err) {
      console.log(err);
    }
  }

  saveSavingsAccounts(savingsAccounts) {
    return this.assetsService.userAssets.pipe(
      take(1),
      switchMap((userAssets) => {
        let observableList: Observable<any>[] = [];
        savingsAccounts.forEach((newAccount) => {
          let updatedAsset = this.findOldSavingsAccount(userAssets, newAccount);
          if (updatedAsset) {
            // just update the amount of the asset, date
            updatedAsset.savingsAccount.amount = newAccount.amount;
            updatedAsset.savingsAccount.date = newAccount.date;
            observableList.push(
              this.assetsService.updateUserAssets([updatedAsset])
            );
          } else {
            observableList.push(
              this.assetsService.addUserAsset(
                new Asset(Math.random().toString(), newAccount, 1)
              )
            );
          }
        });
        return observableList.length === 0
          ? of([])
          : zip(...observableList).pipe(
              switchMap(() => {
                return this.assetsService.fetchUserAssets();
              })
            );
      })
    );
  }

  async fetchSms(since, searchtexts, senderids) {
    let _senderids = [];
    let _searchtexts = [];
    let _since = 0;
    if (senderids && senderids.length) {
      _senderids = senderids;
    }
    if (searchtexts && searchtexts.length) {
      _searchtexts = searchtexts;
    }
    if (since) {
      _since = +new Date(since);
    }

    return SMSPlugin.ensurePermissions().then(
      (success) => {
        return SMSPlugin.fetchSMS();
      },
      (err) => {
        console.log(err);
        return Promise.reject(err);
      }
    );
  }

  findOldSavingsAccount(userAssets: Asset[], smsAccount: SavingsAccount) {
    for (let oldAccount of userAssets) {
      if (oldAccount.assetType !== AssetType.SavingsAccount) {
        continue;
      }
      if (
        oldAccount.savingsAccount.accountNumber === smsAccount.accountNumber
      ) {
        return oldAccount;
      }
    }
  }
}
