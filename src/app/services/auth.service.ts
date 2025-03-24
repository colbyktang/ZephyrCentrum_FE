import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import User from '../models/User';

const httpOptions = {
  headers: environment.headers,
  withCredentials: true
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authUrl = `${environment.API_URL}`;
  currentUser!: User;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const payload = {username: username, password: password};
    return this.http.post(`${this.authUrl}/login`, payload, httpOptions).pipe(
      catchError((err) => {
        return throwError(() => new HttpErrorResponse(err.error));
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const payload = {username: username, email: email, password: password};
    return this.http.post(
      environment.API_URL + 'register',
      payload,
      httpOptions
    );
  }

  logout(): Observable<any> {
    return this.http.post(environment.API_URL + 'logout', {}, httpOptions);
  }
}
