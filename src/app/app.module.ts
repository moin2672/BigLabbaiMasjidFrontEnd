import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from './auth/auth-interceptor';

import { StreetCreateComponent } from './street/street-create/street-create.component';
import { StreetListComponent } from './street/street-list/street-list.component';
import { StreetService } from './street/street.service';

import { MemberCreateComponent } from './member/member-create/member-create.component';
import { MemberListComponent } from './member/member-list/member-list.component';
import { MemberService } from './member/member.service';

import { ErrorInterceptor } from './error-interceptor';
import { DateService } from './shared/date.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UrlService } from './shared/url.service';
import { MemberGroupListComponent } from './member/member-group-list/member-group-list.component';
import { SheetComponent } from './sheet/sheet.component';
import { ResetComponent } from './auth/reset/reset.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    ResetComponent,
    SignupComponent,
    StreetCreateComponent,
    StreetListComponent,
    MemberCreateComponent,
    MemberListComponent,
    MemberGroupListComponent,
    DashboardComponent,
    SheetComponent,
  ],
  providers: [
    StreetService,
    MemberService,
    AuthService,
    DateService,
    UrlService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
