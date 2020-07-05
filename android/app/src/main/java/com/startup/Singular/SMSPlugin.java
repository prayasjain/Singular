package com.startup.Singular;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.Manifest;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.pm.PackageManager;
import android.net.Uri;
import android.content.ContentResolver;
import android.database.Cursor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import android.util.Log;

@NativePlugin(
  permissionRequestCode = 1,
  permissions = { Manifest.permission.READ_SMS, Manifest.permission.RECEIVE_SMS,
    Manifest.permission.SEND_SMS })
public class SMSPlugin extends Plugin {

  @PluginMethod()
  public void ensurePermissions(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("success", true);
    if (hasRequiredPermissions()) {
      call.resolve(ret);
      return;
    }
    requestPermissions(call);
    //pluginRequestAllPermissions();
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

   @Override
   protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
     super.handleRequestPermissionsResult(requestCode, permissions, grantResults);
     PluginCall savedCall = getSavedCall();
     JSObject ret = new JSObject();
     ret.put("success", true);

     if (!hasRequiredPermissions()) {
       savedCall.error("permission denied");
     } else {
       savedCall.resolve(ret);
     }
   }

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

            } else {

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
      call.resolve(outputData);
    } catch (JSONException e) {
      call.error("Some error Occurred");
    }

  }
}