import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Member } from '../member.model';
import { MemberService } from '../member.service';
import { fromEvent, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { DateService } from '../../shared/date.service';
import { StreetService } from '../../street/street.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.css'],
})
export class MemberCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchName') searchName: ElementRef;
  requestedData = null;
  searchText_Value = null;
  members: Member[] = [];

  memberForm: FormGroup;
  memberData: Member;
  editMode = false;
  isLoading = false;
  mID = '';

  totalPosts = 0; //total no of posts
  postsPerPage = 10; //current page
  currentPage = 1;
  pageSizeOptions = [10, 15, 20];

  streetName_list = [];

  private memberId = null;
  private creator = null;

  private authStatusSub: Subscription;
  private streetSub: Subscription;
  private memberSub: Subscription;

  constructor(
    private memberService: MemberService,
    private streetService: StreetService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dateService: DateService,
    private router:Router
  ) {}

  ngOnInit() {
    this.editMode = false;
    this.memberId = null;
    this.creator = null;

    // GETTING LIST OF CUSTOMER NOS
    this.streetService.getStreetsOnly();
    this.streetSub = this.streetService
      .getStreetOnlyUpdateListener()
      .subscribe((streetData) => {
        this.streetName_list = streetData.streetsOnly;
      });

    this.memberForm = new FormGroup({
      initials: new FormControl(''),
      name: new FormControl('', { validators: [Validators.required] }),
      fathersName: new FormControl('', { validators: [Validators.required] }),
      age: new FormControl('', { validators: [Validators.required] }),
      doorNo: new FormControl('', { validators: [Validators.required] }),
      streetName: new FormControl('', { validators: [Validators.required] }),
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('memberId')) {
        this.editMode = true;
        this.memberId = paramMap.get('memberId');
        this.isLoading = true;
        this.memberService
          .getMember(this.memberId)
          .subscribe((memberDataObtained) => {
            this.isLoading = false;
            this.memberData = memberDataObtained.member;
            //console.log('this.memberData=', this.memberData);
            this.mID = this.memberData.mID;
            this.creator = this.memberData.creator;
            this.memberForm.setValue({
              initials: this.memberData.initials,
              name: this.memberData.name,
              fathersName: this.memberData.fathersName,
              age: this.memberData.age,
              doorNo: this.memberData.doorNo,
              streetName: this.memberData.streetName,
            });
          });
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
      distinctUntilChanged()
    );

    searchTerm.subscribe((res) => {
      //console.log(res);
      this.requestedData = res;
      this.searchText_Value = res;
      setTimeout(() => {
        this.requestedData = null;
      }, 1000);

      this.totalPosts = 0;
      this.postsPerPage = 3; //current page
      this.currentPage = 1;

      if (this.searchText_Value && this.searchText_Value != '') {
        this.memberService.getMembersNameWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );

        this.memberSub = this.memberService
          .getMemberUpdateListener()
          .subscribe(
            (memberData: { members: Member[]; memberCount: number }) => {
              this.isLoading = false;
              this.members = memberData.members;
              this.totalPosts = memberData.memberCount;
              ////console.log(this.members);
            }
          );
      }
    });

    // //console.log("dirty=",this.memberForm.get('name').dirty)
    // //console.log()
    //this.memberForm.get('name').touched
    // this.memberForm.get('name').value
  }

  onSubmit() {
    //console.log('member create=', this.memberForm.value);
    if (this.memberForm.invalid) {
      return;
    }

    const memberData: Member = {
      _id: this.memberId,
      mID: this.mID,
      initials: this.memberForm.value.initials,
      name: this.memberForm.value.name,
      fathersName: this.memberForm.value.fathersName,
      age: this.memberForm.value.age,
      doorNo: this.memberForm.value.doorNo,
      streetName: this.memberForm.value.streetName,
      lastUpdatedDate: this.dateService.getTodaysDate(),
      creator: this.creator,
    };
    this.isLoading = true;
    //console.log('this.editMode=', this.editMode);

    if (!this.editMode) {
      if (this.members.length <= 0) {
        this.saveData_callAPI(memberData);
      } else {
        Swal.fire({
          title: 'Do you want to save a duplicate copy of it?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Save',
          confirmButtonColor: '#0d6efd',
          denyButtonText: `Don't save`,
        }).then((result) => {
          if (result.isConfirmed) {
            //Swal.fire('Saved!', '', 'success')

            //console.log('inside okay');
            this.saveData_callAPI(memberData);
          } else if (result.isDenied) {
            Swal.fire({title:'Changes are not saved', text: '', icon:'info',confirmButtonColor: '#0d6efd',});
          }
        });
      }
    } else {
      const copyMemberDataFromDB = JSON.parse(
        JSON.stringify(this.memberData)
      ) as typeof this.memberData;
      const copyMemberDataFromForm = JSON.parse(
        JSON.stringify(memberData)
      ) as typeof memberData;

      delete copyMemberDataFromDB['__v'];
      delete copyMemberDataFromDB['lastUpdatedDate'];
      delete copyMemberDataFromForm['lastUpdatedDate'];

      // //console.log('copyMemberDataFromDB=', copyMemberDataFromDB);
      // //console.log('copyMemberDataFromForm=', copyMemberDataFromForm);
      // //console.log('this.memberData=', this.memberData);
      // //console.log('memberData=', memberData);

      //COMPARING OBJECTS
      if (
        JSON.stringify(copyMemberDataFromDB) ===
        JSON.stringify(copyMemberDataFromForm)
      ) {
        Swal.fire({
          title: 'No Updates done to this member.',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Go to Members List',
          confirmButtonColor: '#0d6efd',
          denyButtonText: `Stay here`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/member']);
          } 
        });
      } else {
        this.saveData_callAPI(memberData);
      }
    }
  }

  saveData_callAPI(memberData) {
    if (!this.editMode) {
      //console.log('memberData=', memberData);
      this.memberService.addMember(memberData);
    } else {
      this.memberService.updateMember(memberData);
    }
    this.memberForm.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.streetSub.unsubscribe();
    if (this.memberSub) {
      this.memberSub.unsubscribe();
    }
  }
}
