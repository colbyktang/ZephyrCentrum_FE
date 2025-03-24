import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:4200'
      },
    });

    return next.handle(req);
  }
}

// Convert class-based interceptor to a function
export const httpInterceptorFn: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<any> => {
    const interceptor = new HttpRequestInterceptor();
    
    // Create a handler adapter that implements HttpHandler
    const handlerAdapter: HttpHandler = {
      handle: (request) => next(request)
    };
    return interceptor.intercept(req, handlerAdapter);
};

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];