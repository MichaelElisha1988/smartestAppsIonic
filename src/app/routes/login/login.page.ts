import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { GeneralDataService } from 'src/app/services/general-data.service';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [CommonModule, IonContent, ReactiveFormsModule],
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('0.3s', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [animate('0.3s', style({ opacity: 0, height: 0 }))]),
    ]),
  ],
})
export class LoginPage {
  loginSrv = inject(LoginService);
  loaderService = inject(smartestAppsStore);
  dataStore = inject(GeneralDataService).appDataStore;
  router = inject(Router);
  loginForm = new FormGroup({
    usenName: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    passwordConfirm: new FormControl('', {
      updateOn: 'change',
      validators: [],
    }),
  });
  errorMsg: string | null = null;
  isRegister: boolean = false;
  isReset: boolean = false;

  constructor() {}

  ngOnInit() {}

  register() {
    this.isRegister = !this.isRegister;
    this.isReset = false;
    this.errorMsg = '';
    this.isRegister
      ? this.loginForm.controls.passwordConfirm.addValidators(
          Validators.required
        )
      : this.loginForm.controls.passwordConfirm.removeValidators(
          Validators.required
        );

    this.loginForm.controls.passwordConfirm.updateValueAndValidity();
  }

  toggleReset() {
      this.isReset = !this.isReset;
      this.isRegister = false;
      this.errorMsg = '';
  }

  onSubmit(isRegister: boolean) {
    this.errorMsg = '';
    
    // RESET PASSWORD LOGIC
    if (this.isReset) {
        if (this.loginForm.controls.usenName.valid) {
            this.loaderService.showLoader(true);
            this.loginSrv.resetPassword(this.loginForm.controls.usenName.value!)
            .then(() => {
                this.loaderService.showLoader(false);
                this.dataStore.setLoginError('Reset email sent! Check your inbox.');
                this.isReset = false;
            })
            .catch((error) => {
                this.loaderService.showLoader(false);
                this.dataStore.setLoginError(error.message);
            });
        } else {
             this.dataStore.setLoginError('Please enter a valid email address.');
        }
        return;
    }

    // REGISTER LOGIC
    if (isRegister) {
      if (
        this.loginForm.controls.password.value ===
        this.loginForm.controls.passwordConfirm.value
      ) {
        this.loginSrv.createAccount(
          this.loginForm.controls.usenName.value!,
          this.loginForm.controls.password.value!
        ),
          this.loaderService.showLoader(true);
        setTimeout(() => {
          this.isRegister = false;
          this.loginSrv.signIn(
            this.loginForm.controls.usenName.value!,
            this.loginForm.controls.password.value!
          );
          this.dataStore.setLoginError('');
          setTimeout(() => {
            if (sessionStorage.getItem('return')) {
              this.router.navigate([sessionStorage.getItem('return')]);
            } else {
              this.router.navigate(['']);
            }
          }, 1000);
          this.loaderService.showLoader(false);
        }, 1000);
      } else {
        this.dataStore.setLoginError(
          'Please make sure that the Email is currect and the password is eqal'
        );
      }
    } else {
      // LOGIN LOGIC
      this.loaderService.showLoader(true);
      this.loginSrv.signIn(
        this.loginForm.controls.usenName.value!,
        this.loginForm.controls.password.value!
      ).then(() => {
        this.loaderService.showLoader(false);
        if (sessionStorage.getItem('return')) {
          this.router.navigate([sessionStorage.getItem('return')]);
        } else {
          this.router.navigate(['home']); // Navigate explicitly to home
        }
      }).catch(() => {
        this.loaderService.showLoader(false);
      });
    }
  }
}
