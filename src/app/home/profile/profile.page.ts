import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: firebase.User;
  authSub: Subscription;

  constructor(
    private authService: AuthService
  ) { 
    this.loadData();
  }

  ngOnInit() {
  }

  loadData() {
    this.authSub = this.authService.authInfo.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
  }
}
