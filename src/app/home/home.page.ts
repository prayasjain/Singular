import { Component } from "@angular/core";
import { StateService } from "./state.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  constructor(public stateService: StateService) {}
}
