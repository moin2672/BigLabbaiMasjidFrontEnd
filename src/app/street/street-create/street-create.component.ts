import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Street } from '../street.model';
import { StreetService } from '../street.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-street-create',
  templateUrl: './street-create.component.html',
  styleUrls: ['./street-create.component.css'],
})
export class StreetCreateComponent implements OnInit, OnDestroy {
  streetForm: FormGroup;
  streetData: Street;
  editMode = false;
  isLoading=false;
  private streetId=null;
  private creator=null;

  private authStatusSub: Subscription;

  constructor(
    private streetService: StreetService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('streetId')) {
        this.editMode = true;
        this.streetId = paramMap.get('streetId');
        this.isLoading=true;
        this.streetService.getStreet(this.streetId)
                        .subscribe(streetDataObtained=>{
                          this.isLoading=false;
                          this.streetData=streetDataObtained.street
                          this.creator=this.streetData.creator
                          // //console.log(streetDataObtained)
                          // //console.log("on edit")
                          // //console.log("this.streetData=",this.streetData)
                          this.streetForm = new FormGroup({
                            streetName: new FormControl(this.streetData.streetName,{validators:[Validators.required,]}),
                          });
                          // this.streetForm.setValue({
                          //   street:this.streetData.street,                             
                          // })
                        })
      } else {
        this.editMode = false;
        this.streetId = null;
        this.creator=null;
        this.streetForm = new FormGroup({
          streetName: new FormControl('',{validators:[Validators.required,]}),
        });
      }
    });
  }

  onSubmit() {
    //console.log("street create=",this.streetForm.value);
    if (this.streetForm.invalid) {
      return;
    }
    
    const streetData: Street = {_id: this.streetId,streetName: this.streetForm.value.streetName,creator:this.creator};
    this.isLoading=true;
    if (!this.editMode) {
      this.streetService.addStreet(streetData);
    }else{
      this.streetService.updateStreet(streetData);
    }
    this.streetForm.reset();
    this.isLoading=false;
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
