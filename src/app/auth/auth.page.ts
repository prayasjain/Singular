import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.authInfo.subscribe((user) => {
      if (user) {
        this.router.navigateByUrl("/home/tabs/assets");
      }
    });
  }

  onClick() {
    this.authService.login();
  }
}
