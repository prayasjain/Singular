import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

import { Platform } from "@ionic/angular";
import {GooglePlus} from "@ionic-native/google-plus/ngx";
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
  }

  login() {
    
    if (this.platform.is("desktop")) {
      this.afAuth.auth
        .signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then((user) => {
          this.router.navigateByUrl("/home/tabs/assets");
        });
    } else {
      console.log("here");
      this.nativeGoogleLogin().then(() => {
        this.router.navigateByUrl("/home/tabs/assets");
      })
    }
  }

  async nativeGoogleLogin() {
    try {
      const gplusUser = await this.gPlus.login({
        'webClientId': environment.webclientId,
        
        'offline': true,
        'scopes': 'profile email'
      });
      return await this.afAuth.auth.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken)
      )
    } catch (err) {
      console.log(err);
    }
    
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigateByUrl("/auth");
    });
    if (!this.platform.is("desktop")) {
      this.gPlus.logout().then(() => {})
    } 
    
  }
}
