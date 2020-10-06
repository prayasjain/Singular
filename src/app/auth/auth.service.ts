import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

import { Platform } from "@ionic/angular";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _isAuthenticated: boolean = false;
  public authInfo: Observable<firebase.User>;

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  constructor(
    private platform: Platform,
    private gPlus: GooglePlus,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.authInfo = this.afAuth.authState;
    let user = this.gPlus
      .trySilentLogin({
        webClientId: environment.webclientId,
        offline: true,
        scopes: "profile email",
      })
      .then((data) => {
        if (data) {
          return this.afAuth.auth.signInWithCredential(
            firebase.auth.GoogleAuthProvider.credential(user.idToken)
          );
        }
      })
      .then(() => {
        this.router.navigateByUrl("/home/tabs/assets");
      });
  }

  login() {
    this.afAuth.auth
        .signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then((user) => {
          this.router.navigateByUrl("/home/tabs/assets");
        });
    // if (this.platform.is("desktop")) {
    //   this.afAuth.auth
    //     .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    //     .then((user) => {
    //       this.router.navigateByUrl("/home/tabs/assets");
    //     });
    // } else {
    //   this.nativeGoogleLogin().then((data) => {
    //     if (data) {
    //       this.router.navigateByUrl("/home/tabs/assets");
    //     }
    //   });
    // }
  }

  async nativeGoogleLogin() {
    try {
      const gplusUser = await this.gPlus.login({
        webClientId: environment.webclientId,
        offline: true,
        scopes: "profile email",
      });
      return await this.afAuth.auth.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken)
      );
    } catch (err) {
      console.log(err);
    }
  }

  logout() {
    if (this.platform.is("desktop")) {
      this.afAuth.auth.signOut().then(() => {
        this.router.navigateByUrl("/auth");
      });
    } else {
      this.afAuth.auth.signOut().then(() => {
        return this.gPlus.logout();
      })
      .then(() => {
        this.router.navigateByUrl("/auth");
      })
    }
  }
}
