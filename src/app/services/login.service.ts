import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Header } from '../models/headerData.model';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { getFirestore } from 'firebase/firestore';
import { GeneralDataService } from './general-data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  dataStore = inject(GeneralDataService).appDataStore;
  router = inject(Router);
  private readonly firebaseConfig = {
    apiKey: environment.apiKey,
    authDomain: environment.authDomain,
    projectId: environment.projectId,
    storageBucket: environment.storageBucket,
    messagingSenderId: environment.messagingSenderId,
    appId: environment.appId,
    measurementId: environment.measurementId,
  };

  fbDataBase: FirebaseApp;
  DataBaseApp: any;
  headerInnerData = new Subject<Header>();

  constructor() {
    this.fbDataBase = initializeApp(this.firebaseConfig);
    this.DataBaseApp = getFirestore(this.fbDataBase);
  }

  setAfterLogin() {
    this.dataStore.setAfterLogin(this.dataStore.login$ != null);
  }

  getfbDataBase(): FirebaseApp {
    return this.fbDataBase;
  }
  getDataBaseApp(): any {
    return this.DataBaseApp;
  }

  createAccount(email: string, password: string) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential: any) => {
        // Signed up
        const user = userCredential?.user;
        // ...
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }
  signIn(email: string, password: string) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential: any) => {
        // Signed up
        const user = userCredential?.user;
        this.dataStore.setLogin(user);
        localStorage.setItem('login', JSON.stringify(user));
        this.setAfterLogin();

        // ...
      })
      .catch((error: any) => {
        const errorCode = error.code;
        this.dataStore.setLoginError(
          error.code.includes('auth')
            ? 'Invalid email or password'
            : 'Unexpected error occurred. Please try again later.'
        );
        throw error; // Re-throw so component knows it failed
      });
  }
  logOut() {
    const auth = getAuth();
    this.dataStore.setAfterLogin(false);
    this.dataStore.setLogin(null);
    localStorage.removeItem('login');
    signOut(auth);
    location.reload();
  }

  resetPassword(email: string) {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  }
}
