import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isAuthenticated: boolean = true;

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  constructor() { }
}
