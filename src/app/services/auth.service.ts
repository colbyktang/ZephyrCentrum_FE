import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError, tap, BehaviorSubject, take, switchMap } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import User from '../models/User';
import { CsrfService } from './csrf.service';

const httpOptions = {
  headers: environment.headers,
  withCredentials: true
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = `${environment.API_URL}/auth`;
  currentUser!: User;
  
  constructor(
    private http: HttpClient,
    private csrfService: CsrfService
  ) {}

  login(username: string, password: string): Observable<any> {
    const payload = {username: username, password: password};
    
    return this.http.post(`${this.apiUrl}/login`, payload, { 
      withCredentials: true
    }).pipe(
      catchError((err) => {
        return throwError(() => new HttpErrorResponse(err.error));
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const payload = {username: username, email: email, password: password};
    
    return this.http.post(
      `${this.apiUrl}/register`,
      payload,
      { withCredentials: true }
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.csrfService.clearToken();
      })
    );
  }
  
  checkAuthentication(): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-auth`, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response && response.data && response.data.user) {
            const userData = response.data.user;
            const createdDate = userData.createdDate ? new Date(userData.createdDate) : new Date();
            this.currentUser = new User(
              userData.id,
              userData.email,
              userData.firstName,
              userData.lastName,
              userData.username,
              userData.role,
              createdDate
            );
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
