import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken = new BehaviorSubject<string | null>(null);
  private isBrowser: boolean;
  
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.readCsrfTokenFromCookie();
      // Set up an interval to check for token changes
      setInterval(() => this.readCsrfTokenFromCookie(), 5000);
    }
  }

  getCsrfToken(): Observable<string | null> {
    if (this.isBrowser) {
      this.readCsrfTokenFromCookie();
    }
    return this.csrfToken.asObservable();
  }

  fetchCsrfToken(): Observable<string | null> {
    return this.http.get<string>(`${environment.API_URL}/auth/csrf-token`, { withCredentials: true }).pipe(
      switchMap(token => {
        this.csrfToken.next(token);
        return this.csrfToken.asObservable();
      })
    );
  }

  readCsrfTokenFromCookie(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const name = 'XSRF-TOKEN=';
      const decodedCookie = decodeURIComponent(document.cookie);
      // console.log('Current cookies:', decodedCookie);
      
      const cookieArray = decodedCookie.split(';');
      
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
          const token = cookie.substring(name.length, cookie.length);
          // console.log('Found CSRF token:', token);
          if (token !== this.csrfToken.value) {
            this.csrfToken.next(token);
          }
          return;
        }
      }
      // console.log('No CSRF token found in cookies');
    } catch (error) {
      console.error('Error reading CSRF token:', error);
    }
  }

  clearToken(): void {
    this.csrfToken.next(null);
  }
} 