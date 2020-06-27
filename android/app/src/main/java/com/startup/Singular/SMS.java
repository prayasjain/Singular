package com.startup.Singular;

import org.json.JSONObject;
import android.database.Cursor;
import org.json.JSONException;
import com.getcapacitor.JSObject;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SMS {

    public static final Pattern amountPattern = Pattern.compile("(?:balance\\sis\\snow\\s|(?:avb?l\\s+)?bal\\s*:?-?)\\s*(?:inr|rs\\.)\\s*([\\d,]+\\.\\d{0,2})"); //amount is group 1
    public static final Pattern accountPattern = Pattern.compile("(?:acct|a/?c)\\s*([a-z])\\1+(\\d{3,})"); // account number is group 2

    public int id;
    public String address;
    public String body;
    public Boolean read;
    public long date;

    public SMS(Cursor cursor) {
        this.id = cursor.getInt(cursor.getColumnIndexOrThrow("_id"));
        this.address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
        this.body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
        this.read = cursor.getInt(cursor.getColumnIndexOrThrow("read")) == 1;
        this.date = cursor.getLong(cursor.getColumnIndexOrThrow("date"));
    }

    private boolean applySenderFilter(String[] senderids) {
        for (int i = 0; i < senderids.length; i++) {
            if (this.address.equals(senderids[i])) {
                return true;
            }
        }
        return false;
    }

    public boolean applyFilters(long sinceDate, String[] searchKeys, String[] senderids) {
        if (this.date <= sinceDate) {
            return false;
        }
        if (senderids.length + searchKeys.length == 0) {
            // Get all SMS.
            return true;
        }
        return this.applyBodySearchFilters(searchKeys) || this.applySenderFilter(senderids);
    }

    private boolean applyBodySearchFilters(String[] searchKeys) {
        for (int i = 0; i < searchKeys.length; i++) {
            if (this.body.toLowerCase().contains(searchKeys[i].toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    public JSObject writeJSON() throws JSONException {
        JSObject sms = new JSObject();
        sms.put("id", this.id);
        sms.put("address", this.address);
        sms.put("body", this.body);
        sms.put("read", this.read);
        sms.put("date", this.date);
        return sms;
    }

    public JSObject getAccountInfo() {
        JSObject accountInfo = new JSObject();
        if (this.body == null) {
            return null;
        }
        String text = this.body.trim().toLowerCase();
        Matcher amountMatcher = amountPattern.matcher(text);

        Matcher accountMatcher = accountPattern.matcher(text);
        if (!amountMatcher.find() || !accountMatcher.find()) {
            return null;
        }
        try {
            String rawAmount = amountMatcher.group(1);
            if (rawAmount == null || rawAmount.isEmpty()) {
                return null;
            }
            String account = accountMatcher.group(2);
            if (account == null || account.isEmpty()) {
                return null;
            }
            double amount = Double.parseDouble(rawAmount.replaceAll(",",""));
            accountInfo.put("account", account);
            accountInfo.put("amount", amount);
            accountInfo.put("id", this.id);
            accountInfo.put("date", this.date);
            accountInfo.put("bankName", this.address);
        } catch(IndexOutOfBoundsException e) {
            return null;
        }


        return accountInfo;
    }
}