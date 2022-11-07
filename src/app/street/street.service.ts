import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Street } from './street.model';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/streets";

@Injectable()
export class StreetService {
  private streets: Street[] = [];
  private streetsUpdated = new Subject<{streets:Street[], streetCount:number}>();
  private streetsOnly: string[] = [];
  private streetsOnlyUpdated = new Subject<{streetsOnly:string[]}>();


  private homeStreetProp: BehaviorSubject<{totalPosts:number, clicked:boolean}> = new BehaviorSubject<{totalPosts:number, clicked:boolean}>({totalPosts:0, clicked:false});
  public homeStreetProp$: Observable<{totalPosts:number, clicked:boolean}> = this.homeStreetProp.asObservable();

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

  setHomeStreetProp(totalPosts:number, clicked:boolean){
    this.homeStreetProp.next({totalPosts:totalPosts, clicked: clicked})
  }

  getStreets(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; streets: Street[], maxStreets:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((streetData) => {
        //console.log("streetData=",streetData)
        this.streets = streetData.streets;
        this.streetsUpdated.next({streets:[...this.streets], streetCount:streetData.maxStreets});
      });
  }
  getStreetUpdateListener() {
    return this.streetsUpdated.asObservable();
  }

  getStreetsWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.streets];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; streets: Street[]; maxStreets: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.streets = postData.streets;

        ////console.log(postData);
        this.streetsUpdated.next({
          streets: [...this.streets],
          streetCount: postData.maxStreets
        });
      });
  }
  
  getStreetsOnly() {
    this.httpClient
      .get<{ streetsOnly: any[] }>(
        BACKEND_URL+'/streetonly'
      )
      .subscribe((streetData) => {
        this.streetsOnly = streetData.streetsOnly;
        this.streetsOnlyUpdated.next({streetsOnly:[...this.streetsOnly]});
      });
  }
  getStreetOnlyUpdateListener() {
    return this.streetsOnlyUpdated.asObservable();
  }

  getStreet(streetId:string){
    return this.httpClient.get<{street:Street}>(BACKEND_URL+"/"+streetId);
  }

  getTotalNoOfStreets(){
    return this.httpClient.get<{message:string; totalStreets:number}>(BACKEND_URL+'/total')
  }

  addStreet(street: Street) {
    this.httpClient
      .post<{ message: string, streetId:string }>(BACKEND_URL, street)
      .subscribe((responseData) => {
        //console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Street Added Successfully'
        })
        this.router.navigate(['/street']);   
      });
  }

  addStreetThroughExcel(street: Street) {
    return this.httpClient
      .post<{ message: string, streetId:string }>(BACKEND_URL, street)
     
  }

  updateStreet(street: Street){
    //console.log("in updateStreet",street)
    this.httpClient.put(BACKEND_URL+"/"+street._id, street)
    .subscribe(response=>{
      // //console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Street Updated Successfully'
      })
      this.router.navigate(['/street']);
    })
  }

  deleteStreet(streetId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + streetId)
     
  }
}
