import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { first, fromEvent, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Street } from '../street.model';
import { StreetService } from '../street.service';
import Swal from 'sweetalert2';
import { map, debounceTime } from 'rxjs/operators';
import { UrlService } from '../../shared/url.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-street-list',
  templateUrl: './street-list.component.html',
  styleUrls: ['./street-list.component.css'],
})
export class StreetListComponent implements OnInit,AfterViewInit, OnDestroy {

  @ViewChild('searchInput') searchName: ElementRef;
  requestedData=null;
  searchText_Value = null;
  clicked=false;
  
  prev_Url = '';

  isLoading = false;

  previousUrl: Observable<string> = this.urlService.previousUrl$;
  streets: Street[] = [];
  private streetSub: Subscription;

  totalPosts = 0; //total no of posts
  postsPerPage = 10; //current page
  currentPage = 1;
  pageSizeOptions = [10, 15, 20];

  /* checking the new pagination */
  totalPages = 0;
  // totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
  forward = false;
  backward = false;

  userIsAuthenticated = false;
  private authStreetSub: Subscription;

  userId: string;

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  constructor(
    private streetService: StreetService,
    private authService: AuthService,
    private urlService:UrlService
  ) {}

  onIncrement() {
    this.isLoading = true;
    //console.log('on Inc');
    //console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.streetService.getStreets(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  onDecrement() {
    this.isLoading = true;
    //console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.streetService.getStreets(this.postsPerPage, this.currentPage);
      this.updatePagination();
    }
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
    //console.log('currentpage=', this.currentPage);
    //console.log('totalPages=', this.totalPages);
    //console.log('totalPosts=', this.totalPosts);
    //console.log(Math.ceil(this.totalPosts / this.postsPerPage));
    if (this.currentPage <= 1) {
      if (this.totalPages <= 1) {
        // this.hide = true;
      } else {
        // this.hide = false;
        if (this.currentPage < this.totalPages) {
          this.forward = true;
          this.backward = false;
        }
      }
    } else {
      if (this.currentPage < this.totalPages) {
        this.forward = true;
        this.backward = true;
      }
      if (this.currentPage == this.totalPages) {
        this.forward = false;
        this.backward = true;
      }
    }
  }

  ngOnInit() {

    this.isLoading = true;

    this.urlService.previousUrl$.pipe(first()).subscribe((previousUrl: string) => {
      //console.log('previousUrl=', previousUrl);
      this.prev_Url = previousUrl;
    });

    if (this.prev_Url === '/home') {
      this.streetService.homeStreetProp$.pipe(first()).subscribe((data) => {
        //console.log('obtained data=', data);
        if(data.clicked){
          this.clicked=!this.clicked
          this.postsPerPage = data.totalPosts;
          this.currentPage = 1;
          this.streetService.getStreets(this.postsPerPage, this.currentPage);
        }else{
          this.streetService.getStreets(this.postsPerPage, this.currentPage);
        }
      });
    }else{
      this.streetService.getStreets(this.postsPerPage, this.currentPage);
    }
    
    this.userId = this.authService.getUserId();
    this.streetSub = this.streetService
      .getStreetUpdateListener()
      .subscribe((streetData: { streets: Street[]; streetCount: number }) => {
        this.isLoading = false;
        this.streets = streetData.streets;
        this.totalPosts = streetData.streetCount;
        this.updatePagination();
        //console.log('from db:', streetData);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStreetSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  OnDelete(streetId: string) {

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.streetService.deleteStreet(streetId).subscribe({
          next: () => {
            this.streetService.getStreets(this.postsPerPage, this.currentPage);
            this.Toast.fire({
              icon: 'success',
              title: 'Street Deleted Successfully',
            });
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            console.info('Street Deletion Complete');
          },
        });
        // Swal.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else {
        Swal.fire({title:'Cancelled', text: 'Your data is safe :)', icon:'error',confirmButtonColor: '#0d6efd',});
      }
    });
  
  }

  ngAfterViewInit() {
    const searchTerm = fromEvent<any>(
      this.searchName.nativeElement,
      'keyup'
    ).pipe(
      map((event) => event.target.value),
      debounceTime(1000),
      //distinctUntilChanged()
    );

    searchTerm.subscribe((res) => {
      //console.log("=>",res);
      this.requestedData = res;
      this.searchText_Value = res;
      setTimeout(() => {
        this.requestedData = null;
      }, 2000);

      // this.totalPosts = 0;
      // this.postsPerPage = 3; //current page
      // this.currentPage = 1;

      if (this.searchText_Value && this.searchText_Value != '') {
        //console.log("value")
        this.postsPerPage = 10;
        this.currentPage = 1;

        this.streetService.getStreetsWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );

        this.streetSub = this.streetService
          .getStreetUpdateListener()
          .subscribe(
            (streetData: { streets: Street[]; streetCount: number }) => {
              this.isLoading = false;
              this.streets = streetData.streets;
              this.totalPosts = streetData.streetCount;
              this.updatePagination();
              //console.log(this.streets);
            }
          );
      }else{
        //console.log("no value")
        this.streetService.getStreets(this.postsPerPage, this.currentPage);
        this.streetSub = this.streetService
      .getStreetUpdateListener()
      .subscribe(
        (streetData: { streets: Street[]; streetCount: number }) => {
          this.isLoading = false;
          this.streets = streetData.streets;
          this.totalPosts = streetData.streetCount;
          this.updatePagination();
          //console.log('from db:', streetData);
        }
      );
      }
    });
  }

  ngOnDestroy() {
    this.streetSub.unsubscribe();
    this.authStreetSub.unsubscribe();
    this.streetService.setHomeStreetProp(0,false);
    this.clicked=!this.clicked
  }

  export(){
    //console.log(this.streets)
    // arr.map(sub_arr=>[sub_arr[1],sub_arr[2],sub_arr[3],sub_arr[4],sub_arr[5],sub_arr[6],sub_arr[7]])
    let arr=this.object_to_array_converter(this.streets)
    let arr_result=arr.map(sub_arr=>[sub_arr[1]])
     /* generate worksheet */
     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(arr_result);
     /* generate workbook and add the worksheet */
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Streets');
  
     /* save to file */
     XLSX.writeFile(wb, "Streets_Data.xlsx");
  }
  
    object_to_array_converter(result) {
      let array_output = [];
  
      result.forEach((val) => {
        // //console.log("val",val, Object.keys(val))
        let out = [];
        for (const key of Object.keys(val)) {
          // //console.log(key)
          if (array_output.length === 0) {
            out.push(key);
          } else {
            out.push(val[key]);
          }
        }
        array_output.push(out);
      });
      // //console.log("=>",array_output)
      return array_output;
    }

}
