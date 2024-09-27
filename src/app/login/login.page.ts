import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  loginForm: FormGroup;
  showPassword = false;
  text: any = 'password';
  name: any = 'eye-off-outline';
  // rememberDetails: any = [];
  // rememberMeChecked: boolean = false;

  constructor(
    public CommonService: CommonService,
    public router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required,])),
      password: new FormControl('', Validators.compose([Validators.required,])),
      rememberMe: new FormControl(false),
    })
  }

  ionViewWillEnter() {
    this.rememberMe();
  }

  login() {
    if (this.loginForm.valid) {
      const userData = localStorage.getItem('signup');

      const users = userData ? JSON.parse(userData) : [];
      const enteredEmail = this.loginForm.value.email;
      const enteredPassword = this.loginForm.value.password;
      const user = users.find((u: any) => u.email === enteredEmail && u.password === enteredPassword);

      console.log('loginuser', user);

      if (user) {

        localStorage.setItem("login", JSON.stringify(user));
        console.log('Login successful', this.loginForm.value);
        this.CommonService.presentToast('User Login Successful');

        if (this.loginForm.value.rememberMe) {
          localStorage.setItem('remember', JSON.stringify({
            email: enteredEmail,
            password: enteredPassword
          }));
        }
        else {
          localStorage.removeItem('remember');
        }

        // console.log("Form Submitted!");
        this.loginForm.reset();
        this.router.navigate(['/home']);

      }
      else {
        this.CommonService.presentToast('Invalid email or password');
        this.loginForm.reset();

      }

    }

    else {
      console.log('Form is invalid. Cannot login.');
    }

  }

  changetype() {
    this.text = this.text == 'text' ? 'password' : 'text'
    this.name = this.name == 'eye-outline' ? 'eye-off-outline' : 'eye-outline'
  }

  toggleShow() {
    this.showPassword = !this.showPassword;
  }

  rememberMe() {
    // const loginUser = JSON.parse(localStorage.getItem('login') || '[]');
    const rememberUser = JSON.parse(localStorage.getItem('remember') || '[]');
    if (rememberUser) {
      this.loginForm.patchValue({
        email: rememberUser.email,
        password: rememberUser.password,
        rememberMe: true,
      });
      // this.rememberMeChecked = true;
    }
  }

}



