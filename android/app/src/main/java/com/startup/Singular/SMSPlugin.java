package com.startup.Singular;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.Manifest;
import org.json.JSONArray;
import org.json.JSONException;
import android.net.Uri;
import android.content.ContentResolver;
import android.database.Cursor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import android.util.Log;

@NativePlugin(permissions = { Manifest.permission.READ_SMS, Manifest.permission.RECEIVE_SMS,
    Manifest.permission.SEND_SMS })
public class SMSPlugin extends Plugin {

  @PluginMethod()
  public void ensurePermissions(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("success", true);
    if (hasRequiredPermissions()) {
      System.out.println("inside permission");
      System.out.println(ret);
      call.resolve(ret);
      return;
    }
    pluginRequestAllPermissions();
    if (hasRequiredPermissions()) {
      call.resolve(ret);
    } else {
      call.error("Permission Denied");
    }
  }

  private String[] getStringArrayFromJSONArray(JSONArray array) throws JSONException {
    if (array == null) {
      return new String[] {};
    }
    String[] stringArray = new String[array.length()];
    for (int i = 0; i < stringArray.length; i++) {
      stringArray[i] = array.getString(i);
    }
    return stringArray;
  }

//  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
//    Log.v("SMSReader", "Called action " + action);
//    try {
//      ArrayList<SMS> sms = new ArrayList<SMS>();
//      switch (action) {
//        case "permission": {
//          this.ensurePermissions(this.getStringArrayFromJSONArray(data.getJSONArray(0)), callbackContext);
//          return true;
//        }
//        case "all": {
//          sms = this.fetchSMS(data.getLong(0), new String[] {}, new String[] {});
//        }
//          break;
//        case "filterbody": {
//          String[] searchstrings = this.getStringArrayFromJSONArray(data.getJSONArray(1));
//          if (searchstrings.length > 0) {
//            sms = this.fetchSMS(data.getLong(0), searchstrings, new String[] {});
//          }
//        }
//          break;
//        case "filtersenders": {
//          String[] senderids = this.getStringArrayFromJSONArray(data.getJSONArray(2));
//          if (senderids.length > 0) {
//            sms = this.fetchSMS(data.getLong(0), new String[] {}, senderids);
//          }
//        }
//          break;
//        case "filterbodyorsenders": {
//          String[] searchstrings = this.getStringArrayFromJSONArray(data.getJSONArray(1));
//          String[] senderids = this.getStringArrayFromJSONArray(data.getJSONArray(2));
//          if (searchstrings.length + senderids.length > 0) {
//            sms = this.fetchSMS(data.getLong(0), searchstrings, senderids);
//          }
//        }
//          break;
//        default: {
//          callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.INVALID_ACTION));
//          return false;
//        }
//      }
//      callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, this.convertToJSONArray(sms)));
//      return true;
//    } catch (JSONException e) {
//      callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage()));
//      return false;
//    }
//  }

  // @Override
  // protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
  //   super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

  //   log("handling request perms result");
  //   PluginCall savedCall = getSavedCall();
  //   if (savedCall == null) {
  //     log("No stored plugin call for permissions request result");
  //     return;
  //   }

  //   for (int result : grantResults) {
  //     if (result == PackageManager.PERMISSION_DENIED) {
  //       savedCall.error("User denied permission");
  //       return;
  //     }
  //   }

  //   if (requestCode == REQUEST_IMAGE_CAPTURE) {
  //     // We got the permission
  //   }
  // }

  private JSONArray convertToJSONArray(ArrayList<SMS> sms) throws JSONException {
    JSONArray smsResult = new JSONArray();
    int resultLength = sms.size();
    for (int i = 0; i < resultLength; i++) {
      smsResult.put(sms.get(i).writeJSON());
    }
    return smsResult;
  }

  @PluginMethod()
  public void fetchSMS(PluginCall call) {

    try {
      Map<String, JSObject> accountDataMap = new HashMap<>();
      Uri message = Uri.parse("content://sms/inbox");
      ContentResolver contentResolver = getActivity().getContentResolver();

      Cursor cursor = contentResolver.query(message, null, null, null, null);
      if (cursor == null) {
        return;
      }
      JSObject outputData = new JSObject();
      int totalSMS = cursor.getCount();
      if (cursor.moveToFirst()) {
        for (int i = 0; i < totalSMS; i++) {
          SMS sms = new SMS(cursor);
          cursor.moveToNext();
          JSObject accountInfo = sms.getAccountInfo();
          if (accountInfo == null) {
            continue;
          }
          if (accountDataMap.containsKey(accountInfo.getString("account"))) {
            JSObject existingInfo = accountDataMap.get(accountInfo.getString("account"));
            if (existingInfo.getLong("date") > accountInfo.getLong("date")) {
              System.out.println("skipping old record");
            } else {
              System.out.println("updating account record");
              accountDataMap.put(accountInfo.getString("account"), accountInfo);

            }
          } else {
            accountDataMap.put(accountInfo.getString("account"), accountInfo);
          }
        }
      }

      cursor.close();
      for(JSObject jsObject : accountDataMap.values()) {
        outputData.put(String.valueOf(jsObject.get("id")), jsObject);
      }
      System.out.println(outputData);
      System.out.println("came till here....");
      call.resolve(outputData);
    } catch (JSONException e) {
      call.error("Some error Occurred");
    }

  }
}