import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from './auth/auth.service';
import { UrlService } from './shared/url.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {

  previousUrl: string = null;
  currentUrl: string = null;

  constructor(private authService:AuthService, private router: Router, private urlService: UrlService){
  }

  ngOnInit(){
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        this.urlService.setPreviousUrl(this.previousUrl);
      });

    this.authService.autoAuthUser();
  }
  
}
