import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import User from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private authState = new BehaviorSubject<boolean>(false);
  private userData = new BehaviorSubject<any>({});
  private lastCheckTime = 0;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {
    // Check authentication status when service is initialized
    if (this.isBrowser) {
      this.checkAuthenticationStatus();
    }
  }

  // Check authentication status with the server using fetch API
  private checkAuthenticationStatus(): void {
    if (!this.isBrowser) {
      return;
    }

    const now = Date.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return;
    }

    this.lastCheckTime = now;
    this.authService.checkAuthentication().pipe(
      tap(userData => {
        if (userData && userData.data && userData.data.user) {
          const user = userData.data.user;
          // Parse the date string from the backend
          const createdDate = user.createdDate ? new Date(user.createdDate) : new Date();
          this.authState.next(true);
          this.userData.next({
            ...userData,
            data: {
              ...userData.data,
              user: new User(
                user.id,
                user.email,
                user.firstName,
                user.lastName,
                user.username,
                user.role,
                createdDate
              )
            }
          });
        } else {
          this.authState.next(false);
          this.userData.next({});
        }
      }),
      catchError(() => {
        this.authState.next(false);
        this.userData.next({});
        return of(null);
      })
    ).subscribe();
  }

  isLoggedIn(): Observable<boolean> {
    if (this.isBrowser) {
      this.checkAuthenticationStatus();
    }
    return this.authState.asObservable();
  }

  getUser(): Observable<any> {
    return this.userData.asObservable();
  }

  // Clean user session - only triggers server-side logout
  // since HTTP-Only cookies can't be directly manipulated on client
  clean(): void {
    this.authState.next(false);
    this.userData.next({});
    this.lastCheckTime = 0;
  }

  // Save user data in memory (not in storage as cookies are managed by server)
  public saveUser(user: any): void {
    if (user && user.data && user.data.user) {
      const userData = user.data.user;
      // Parse the date string from the backend
      const createdDate = userData.createdDate ? new Date(userData.createdDate) : new Date();
      this.userData.next({
        ...user,
        data: {
          ...user.data,
          user: new User(
            userData.id,
            userData.email,
            userData.firstName,
            userData.lastName,
            userData.username,
            userData.role,
            createdDate
          )
        }
      });
      this.authState.next(true);
      this.lastCheckTime = Date.now();
    }
  }

  // Get current login state as boolean
  public isLoggedInValue(): boolean {
    return this.authState.getValue();
  }
}
