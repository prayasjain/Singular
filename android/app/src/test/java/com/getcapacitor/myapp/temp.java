package com.getcapacitor.myapp;

import org.junit.Test;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class temp {

    @Test
    public void temp() {
        Pattern amountPattern = Pattern.compile("(?:balance\\sis\\snow\\s|(?:avb?l\\s+)?bal\\s*:?-?)\\s*(?:\\(.*\\))?\\s*(?:(?:inr|rs)\\.?)\\s*([\\d,]+\\.\\d{0,2})");
        Pattern accountPattern = Pattern.compile("(?:acct|a/?c)\\s*([a-z])\\1+(\\d{3,})");
        String text1 = "UPDATE: INR 56,260.00 deposited in A/c XX1966 on 26-JUN-20 for AC-Prayas Jain-CITIN20087012176.Avl bal:INR 1,01,724.05 subject to clearing".trim().toLowerCase();
        String text2 = "IDBI Bank A/c NN00082 debited for INR 40000.00 thru Net Bkg. Bal INR 53709.64 (incl. of uncleared chqs) as of 14 JUN 09:27hr. If not used by you, call 18002094324".trim().toLowerCase();
        String text3 = "Dear Customer,Rs.6000 debited from your A/c XX0623 via FBL-AVADI ATM on 30OCT2019 12:08:12.BAL-Rs.2451.35.Call 18004251199,if not done by you-Federal Bank".trim().toLowerCase();
        String text4 = "Rs.3000 withdrawn via ATM from a/c XX7229. The balance is now Rs.93443.55. NonCiti ATM usage this month: Metro 1, NonMetro 0. Charges as per TnC. In case this transaction was not initiated by you, click here https://citi.asia/INtrxndisp?refno=229898021482884420200224".trim().toLowerCase();
        String text5 = "UPDATE: INR 67,858.00 deposited in A/c XX7918 on 06-MAR-20 for NEFT Cr-KKBK0000958-RISHIKESH GANGULY-RISHIKESH GANGULY-KKBKH20066762125.Avl bal:INR 2,00,000.00 subject to clearing".trim().toLowerCase();
        String text6 = "Acct XX654 debited with INR 10,526.42 on [12-Jun-20.Info](http://12-jun-20.info/): ATD*Auto Debi.Avbl Bal:INR 32,521.99.Call 18002662 for dispute or SMS BLOCK 654 to 9215676766".trim().toLowerCase();
        String text7 = "IDBI Bank A/C NN41052 debited INR. 150000.00 Det:TRF TO SUNITA GARG- Chq No 92293. Bal (incl. of chq in clg) INR. 547547.70 as of 02JUL 12:08 hrs.".trim().toLowerCase();
        String text8 = "UPDATE: INR 2,00,000.00 deposited in A/c XX7918 on 08-APR-20 for NEFT Cr-KKBK0000958-RISHIKESH  GANGULY-RISHIKESH GANGULY-KKBKH20099872000.Avl bal:INR 4,01,013.00 subject to clearing".trim().toLowerCase();
//        Pattern test = Pattern.compile("(?:balance\\sis\\snow\\s|(?:avb?l\\s+)?bal\\s*:?-?)\\s*(?:inr|rs\\.)\\s*([\\d,]+\\.\\d{0,2})");
//        Matcher testMatcher = test.matcher(text4);
//        if (testMatcher.find()) {
//            System.out.println(testMatcher.group(1));
//        } else {
//            System.out.println("why not match");
//        }

        for (String text: Arrays.asList(text1,text2,text3,text4,text5,text6, text7, text8)) {
            Matcher accountMatcher = accountPattern.matcher(text);
            if (accountMatcher.find()) {
                System.out.println(accountMatcher.group(2));
            } else {
                System.out.println("not match");
            }
        }

    }
}
