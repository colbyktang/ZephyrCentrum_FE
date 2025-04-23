import { Injectable, Injector, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable, switchMap, take, catchError, throwError } from 'rxjs';
import { CsrfService } from '../services/csrf.service';

// Convert class-based interceptor to a function
export const httpInterceptorFn: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<any> => {
  const injector = inject(Injector);
  const csrfService = injector.get(CsrfService);
  
  // Skip CSRF token for requests to get the CSRF token
  if (req.url.includes('/csrf-token')) {
    return next(req);
  }
  
  // Get CSRF token and add it to the request
  return csrfService.getCsrfToken().pipe(
    take(1),
    switchMap(token => {
      // Clone the request and add the CSRF token header if available
      if (token) {
        req = req.clone({
          setHeaders: {
            'X-XSRF-TOKEN': token
          },
          withCredentials: true
        });
      } else {
        // If no token is available, make a request to get one
        return csrfService.fetchCsrfToken().pipe(
          switchMap(newToken => {
            if (newToken) {
              req = req.clone({
                setHeaders: {
                  'X-XSRF-TOKEN': newToken
                },
                withCredentials: true
              });
              return next(req);
            }
            return throwError(() => new Error('Failed to get CSRF token'));
          })
        );
      }
      
      return next(req).pipe(
        catchError(error => {
          if (error.status === 403 && error.error === 'Invalid CSRF token') {
            // If we get a CSRF error, try to get a new token
            return csrfService.fetchCsrfToken().pipe(
              switchMap(newToken => {
                if (newToken) {
                  const newReq = req.clone({
                    setHeaders: {
                      'X-XSRF-TOKEN': newToken
                    },
                    withCredentials: true
                  });
                  return next(newReq);
                }
                return throwError(() => error);
              })
            );
          }
          return throwError(() => error);
        })
      );
    })
  );
};

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useValue: httpInterceptorFn, multi: true },
];