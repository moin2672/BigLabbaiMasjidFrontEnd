import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { MemberService } from '../member.service';

@Component({
  selector: 'app-member-group-list',
  templateUrl: './member-group-list.component.html',
  styleUrls: ['./member-group-list.component.css']
})
export class MemberGroupListComponent implements OnInit, OnDestroy {

  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  userId: string="";
  isLoading=false;

  memberGroupList=[];

  constructor(private authService: AuthService,private memberService: MemberService) { }

  ngOnInit() {
    this.isLoading=true
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

      this.memberService.getMemberGroupList().subscribe((backEndData)=>{
        //console.log("backEndData=",backEndData)
        this.memberGroupList=backEndData.membersGroupList;
        this.isLoading=false
      })

  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }

}