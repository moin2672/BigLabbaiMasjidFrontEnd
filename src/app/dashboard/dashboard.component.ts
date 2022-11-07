import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberService } from '../member/member.service';
import { StreetService } from '../street/street.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalMembers=0
  totalStreets=0
  membersGroupByStreet=[]

  constructor(private memberService: MemberService, private streetService: StreetService, private router:Router) { }

  ngOnInit() {
    this.memberService.getTotalNoOfMembers().subscribe((backEndData)=>{
      // //console.log(backEndData)
      this.totalMembers=backEndData.totalMembers
    })

    this.streetService.getTotalNoOfStreets().subscribe((backEndData)=>{
      // //console.log(backEndData)
      this.totalStreets=backEndData.totalStreets
    })

    this.memberService.getNoOfMembersGroupByStreet().subscribe((backEndData)=>{
      //console.log(backEndData.membersGroupByStreet)
      this.membersGroupByStreet=backEndData.membersGroupByStreet;
    })

  }

  getTotalMembers(searchTerm){
   
    this.memberService.setHomeMemberProp(this.totalMembers,searchTerm,true)
    this.router.navigate(["/member"])
  }

  getTotalStreets(){
   
    this.streetService.setHomeStreetProp(this.totalStreets,true)
    this.router.navigate(["/street"])
  }

}