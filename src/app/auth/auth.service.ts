import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import { Observable } from "rxjs";
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _isAuthenticated: boolean = false;
  public authInfo: Observable<firebase.User>;

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.authInfo = this.afAuth.authState;
  }

  login() {
    this.afAuth.auth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((user) => {
        this.router.navigateByUrl("/home/tabs/assets");
      });
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigateByUrl("/auth");
    });
  }
}
