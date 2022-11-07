import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Member } from './member.model';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/members";

@Injectable()
export class MemberService {
  private members: Member[] = [];
  private membersUpdated = new Subject<{members:Member[], memberCount:number}>();

  private memberPhoneNos=[]
private memberPhoneNosUpdated = new Subject<{memberPhoneNos:string[]}>();

private homeMemberProp: BehaviorSubject<{totalPosts:number, searchStreet:string, clicked:boolean}> = new BehaviorSubject<{totalPosts:number, searchStreet:string, clicked:boolean}>({totalPosts:0, searchStreet:"", clicked:false});
  public homeMemberProp$: Observable<{totalPosts:number, searchStreet:string, clicked:boolean}> = this.homeMemberProp.asObservable();

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(private httpClient: HttpClient,private router:Router) {}

  setHomeMemberProp(totalPosts:number, searchStreet:string, clicked:boolean){
    this.homeMemberProp.next({totalPosts:totalPosts, searchStreet:searchStreet, clicked: clicked})
  }

  getMembers(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; members: Member[], maxMembers:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((memberData) => {
        //console.log("memberData=",memberData)
        this.members = memberData.members;
        // this.memberPhoneNos=this.members.map(cust=>cust.memberPhoneNo)
        this.membersUpdated.next({members:[...this.members], memberCount:memberData.maxMembers});
      });
  }

  getMembersWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.members];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; members: Member[]; maxMembers: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.members = postData.members;

        ////console.log(postData);
        this.membersUpdated.next({
          members: [...this.members],
          memberCount: postData.maxMembers
        });
      });
  }

  getMembersNameWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.members];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; members: Member[]; maxMembers: number }>(
        BACKEND_URL+"/searchName" + queryParams
      )
      .subscribe(postData => {
        this.members = postData.members;

        ////console.log(postData);
        this.membersUpdated.next({
          members: [...this.members],
          memberCount: postData.maxMembers
        });
      });
  }

  getMemberGroupList(){
    return this.httpClient
    .get<{ message: string; membersGroupList: any[]; }>(
      BACKEND_URL+"/groupbyList"
    )
  }

  getMemberUpdateListener() {
    return this.membersUpdated.asObservable();
  }

  getMember(memberId:string){
    // return {...this.members.find(p=>p._id===memberId)};
    return this.httpClient.get<{member:Member}>(BACKEND_URL+"/"+memberId);
  }


  getTotalNoOfMembers(){
    return this.httpClient.get<{message:string; totalMembers:number}>(BACKEND_URL+'/total')
  }

  getNoOfMembersGroupByStreet(){
    return this.httpClient.get<{message:string; membersGroupByStreet:any[]}>(BACKEND_URL+'/groupby')
  }

getMemberPhoneNos(){
  this.httpClient.get<{memberPhoneNos:any[]}>(BACKEND_URL+'/phone')
                .subscribe((custData)=>{
                  this.memberPhoneNos=custData.memberPhoneNos;
                  this.memberPhoneNosUpdated.next({memberPhoneNos:[...this.memberPhoneNos]})
                })
}

getMemberPhoneNosUpdateListener() {
  return this.memberPhoneNosUpdated.asObservable();
}

  addMember(member: Member) {
    //console.log("adding member=",member)
    this.httpClient
      .post<{ message: string, memberId:string }>(BACKEND_URL, member)
      .subscribe((responseData) => {
        //console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Member Added Successfully'
        })
        this.router.navigate(['/member']);   
      });
  }

  addMemberThroughExcel(member: Member) {
    //console.log("adding member=",member)
    return this.httpClient
      .post<{ message: string, memberId:string }>(BACKEND_URL, member)
      
  }

  updateMember(member: Member){
    //console.log("in updateMember",member)
    this.httpClient.put(BACKEND_URL+"/"+member._id, member)
    .subscribe(response=>{
      // //console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Member Updated Successfully'
      })
      this.router.navigate(['/member']);
    })
  }

  deleteMember(memberId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + memberId)
     
  }
}
