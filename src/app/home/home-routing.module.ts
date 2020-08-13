import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomePage } from "./home.page";

const routes: Routes = [
 
  {
    path: "",
    redirectTo: "/home/tabs/dashboard",
    pathMatch: "full",
  },
  {
    path: "tabs",
    component: HomePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: "assets",
        loadChildren: () =>
          import("./assets/assets.module").then((m) => m.AssetsPageModule),
      },
      {
        path: "goals",
        loadChildren: () =>
          import("./goals/goals.module").then((m) => m.GoalsPageModule),
      },
      {
        path: "",
        redirectTo: "/home/tabs/assets",
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule { }
