import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css'],
})
export class ResetComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  userId = '';
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  form = new FormGroup(
    {
      oldPassword: new FormControl('', { validators: [Validators.required] }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      confirm: new FormControl('', {
        validators: [Validators.required, Validators.minLength(4)],
      }),
    },
    this.passwordMatchValidator
  );

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password').value;
    const confirm = g.get('confirm').value;
    return password === confirm ? null : { mismatch: true };
  }

  passwordErrorMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      const controlInvalid = control.touched && control.invalid;
      const formInvalid =
        control.touched &&
        this.form.get('confirm').touched &&
        this.form.invalid;
      return controlInvalid || formInvalid;
    },
  };

  confirmErrorMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      const controlInvalid = control.touched && control.invalid;
      const formInvalid =
        control.touched &&
        this.form.get('password').touched &&
        this.form.invalid;
      return controlInvalid || formInvalid;
    },
  };

  getErrorMessage(controlName: string) {
    
    if (this.form.controls[controlName].hasError('minlength')) {
      return 'Must be at least 4 characters';
    }
      return 'New & Confirm Passwords must match';
    
  }

  onSubmitResetPassword() {
    if (
      this.form.value.oldPassword == this.form.value.password ||
      this.form.value.oldPassword == this.form.value.confirm
    ) {
      Swal.fire({
        title: 'Invalid Password',
        text: 'Old Password and New Password are same. Kindly update it.',
        icon: 'error',
        confirmButtonColor: '#0d6efd',
      });

      // this.dialog.open(ErrorComponent,{data:{message: "Old Password and New Password are same. Kindly update it."}})
    }

    if (this.form.invalid) {
      return;
    }

    let data: any = {
      userId: this.userId,
      oldPassword: this.form.value.oldPassword,
      newPassword: this.form.value.password,
      confirmNewPassword: this.form.value.confirm,
    };
    ////console.log(this.form.value)
    ////console.log(data);
    this.authService.resetPassword(data);
  }

  onCancel() {
    ////console.log("cancelled");
    this.router.navigate(['/home']);
    // this.orderForm.reset();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
