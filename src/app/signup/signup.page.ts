import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonService } from 'src/app/common.service';

export const StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  signupForm: FormGroup;


  constructor(public CommonService: CommonService) {
    this.signupForm = new FormGroup({
      // role:new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      userId: new FormControl(''),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      address: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern(StrongPasswordRegx)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.pattern(StrongPasswordRegx)]),
    }, { validators: this.PasswordMatchValidator });
  }

  PasswordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;

    }
  }

  signup() {
    if (this.signupForm.valid) {
      // this.signupForm.value.userId=Math.floor(Math.random()*1000)

      let getsignupForm = localStorage.getItem('signup');
      let mysignup = getsignupForm ? JSON.parse(getsignupForm) : [];

      this.signupForm.value.userId = Math.floor(Math.random() * 1000)
      let existinguserId = mysignup.map((entry: any) => entry.userId);
      const entereduserId = this.signupForm.value.userId;
      if (existinguserId.includes(entereduserId)) {
        this.CommonService.presentToast('Assign another userId');
      }




      let existingemails = mysignup.map((entry: any) => entry.email);
      const enteredemail = this.signupForm.value.email;
      if (existingemails.includes(enteredemail)) {
        this.CommonService.presentToast('Email is already in use.Pls choose different mailId.');
      }

      mysignup.push(this.signupForm.value);
      localStorage.setItem('signup', JSON.stringify(mysignup));
      console.log('Form Submitted:', this.signupForm.value);
      this.CommonService.presentToast('Signup Successful');
      this.signupForm.reset();
    }

    else {
      console.log('Form NotSubmitted', this.signupForm.errors);
      this.CommonService.presentToast('Form is Invalid. Cannot Submit');
    }

  }

}
