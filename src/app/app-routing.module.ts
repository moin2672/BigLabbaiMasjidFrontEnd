import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { ResetComponent } from './auth/reset/reset.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MemberCreateComponent } from './member/member-create/member-create.component';
import { MemberGroupListComponent } from './member/member-group-list/member-group-list.component';
import { MemberListComponent } from './member/member-list/member-list.component';
import { SheetComponent } from './sheet/sheet.component';

import { StreetCreateComponent } from './street/street-create/street-create.component';
import { StreetListComponent } from './street/street-list/street-list.component';


const routes: Routes = [
  { path: 'home', component: DashboardComponent,canActivate:[AuthGuard] },
  { path: 'upload', component: SheetComponent,canActivate:[AuthGuard] },
  { path: 'street', component: StreetListComponent, canActivate:[AuthGuard] },
  { path: 'street/new', component: StreetCreateComponent, canActivate:[AuthGuard] },
  { path:'street/edit/:streetId', component: StreetCreateComponent, canActivate:[AuthGuard]},
  { path: 'member', component: MemberListComponent, canActivate:[AuthGuard] },
  { path: 'member/new', component: MemberCreateComponent, canActivate:[AuthGuard] },
  { path: 'member/group', component: MemberGroupListComponent, canActivate:[AuthGuard] },
  { path: 'member/edit/:memberId', component: MemberCreateComponent, canActivate:[AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'reset', component: ResetComponent, canActivate:[AuthGuard]  },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule {}
