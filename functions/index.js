/* eslint-disable promise/catch-or-return */
/* eslint-disable no-loop-func */
/* eslint-disable promise/always-return */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const unirest = require("unirest");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
var serviceAccount = require("./key.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://moneyapp-63c7a.firebaseio.com/",
});

exports.scheduledFunctionCrontab = functions.pubsub
  .schedule("54 17 * * *")
  .timeZone("America/New_York") // Users can choose timezone - default is America/Los_Angeles
  .onRun((context) => {
    var db = admin.database();
    var ref = db.ref();
    const errorFunc = (error) => {
      // if (error) {
      //   console.log("Data could not be saved.");
      //   console.log(error);
      // } else {
      //   console.log("Data saved successfully.");
      // }
    };

    ref.once("value", (snapshot) => {
      let date = new Date();

      for (const [key, value] of Object.entries(snapshot.val())) {
        if (!key.endsWith("assets")) {
          continue;
        }
        const userId = key.substr(0, key.length - "-assets".length);
        const outputObject = {};

        for (const [assetId, assetValue] of Object.entries(value)) {
          let assetCurrentValue;
          if ("savingsAccount" in assetValue) {
            let daysDiff = Math.floor(
              (date.getTime() - new Date(assetValue["savingsAccount"]["date"]).getTime()) / (1000 * 3600 * 24)
            );
            let amount =
              Number(assetValue["savingsAccount"]["amount"]) *
              Math.pow(1 + Number(assetValue["savingsAccount"]["interestRate"]) / 4, Math.floor(daysDiff / 90));
            assetCurrentValue = amount;
          }
          if ("deposits" in assetValue) {
            let depositData = assetValue["deposits"];
            if (!("depositDate" in depositData) || !("maturityDate" in depositData)) {
              assetCurrentValue = Number(depositData["amount"]);
            } else {
              let daysDiff = Math.floor(
                (date.getTime() - new Date(depositData["depositDate"]).getTime()) / (1000 * 3600 * 24)
              );
              let amount =
                Number(depositData["amount"]) *
                Math.pow(1 + Number(depositData["interestRate"]) / 4, Math.floor(daysDiff / 90));
              assetCurrentValue = amount;
            }
          }
          if ("mutualFunds" in assetValue) {
            assetCurrentValue =
              Number(assetValue["mutualFunds"]["currentValue"]) * Number(assetValue["mutualFunds"]["units"]);
          }
          if ("equity" in assetValue) {
            assetCurrentValue = Number(assetValue["equity"]["currentValue"]) * Number(assetValue["equity"]["units"]);
          }
          if ("cash" in assetValue) {
            assetCurrentValue = Number(assetValue["cash"]["amount"]);
          }
          if ("gold" in assetValue) {
            assetCurrentValue = Number(assetValue["gold"]["currentValue"]) * Number(assetValue["gold"]["units"]);
          }
          if ("pPf" in assetValue) {
            assetCurrentValue = Number(assetValue["pPf"]["currentValue"]);
          }
          if ("ePF" in assetValue) {

            assetCurrentValue = Number(assetValue["ePF"]["price"]);
          }
          if ("realEstate" in assetValue) {
            assetCurrentValue = Number(assetValue["realEstate"]["currentValue"]);
          }
          if ("others" in assetValue) {
            assetCurrentValue = Number(assetValue["others"]["amount"]);
          }

          if (assetCurrentValue) {
            outputObject[assetId] = assetCurrentValue;
          }
        }

        if (outputObject && Object.keys(outputObject).length > 0) {
          let writeObject = {};
          writeObject[date] = outputObject;
          ref.child(userId + "-history").update(writeObject, errorFunc);
        }
      }
    });
    return null;
  });

exports.scheduledCalculateCurrentValCronTab = functions.pubsub
  .schedule("1 * * * *")
  .timeZone("America/New_York") // Users can choose timezone - default is America/Los_Angeles
  .onRun(async (context) => {
    try {
      var db2 = admin.database();
      var ref2 = db2.ref();
      let reqHeaders = {
        authority: "indiawealth.in",
        method: "GET",
        //path: `/api/v1/explore/stocksDetails/5656/`,
        scheme: "https",
        accept: "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        origin: "https://www.indmoney.com",
        referer: "https://www.indmoney.com",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
      };

      let snapshot = await ref2.once("value");
      const promises = [];
      for (const [key, value] of Object.entries(snapshot.val())) {
        if (!key.endsWith("assets")) {
          continue;
        }
        for (const [assetId, assetValue] of Object.entries(value)) {
          if ("mutualFunds" in assetValue) {
            let reqUrlMF = `https://limitless-ridge-19843.herokuapp.com/api/finance/price?keys=${assetValue["mutualFunds"]["mstarId"]}&assetType=MutualFunds`;
            promises.push(
              updateRecord(
                unirest.get(reqUrlMF).headers(reqHeaders),
                ref2,
                `${key}/${assetId}/mutualFunds`,
                assetValue["mutualFunds"]["mstarId"]
              )
            );
          }
          if ("equity" in assetValue) {
            let reqUrlEq = `https://limitless-ridge-19843.herokuapp.com/api/finance/price?keys=${assetValue["equity"]["isin"]}&assetType=Equities`;
            promises.push(
              updateRecord(
                unirest.get(reqUrlEq).headers(reqHeaders),
                ref2,
                `${key}/${assetId}/equity`,
                assetValue["equity"]["isin"]
              )
            );
          }
        }
      }
      return Promise.all(promises);
    } catch (error) {
      console.log(error);
      return Promise.reject(new Error("some error occurred"));
    }
  });

// eslint-disable-next-line consistent-return
async function updateRecord(getDataPromise, ref, childPath, key) {
  let resData = await getDataPromise;
  if (resData && resData.body && resData.body.data) {
    let navData = resData.body.data.find((d) => d.key && d.key === key);
    if (navData && navData.nav) {
      let nav = Number(navData.nav);
      return ref.child(childPath).update({ currentValue: nav });
    }
  }
}
