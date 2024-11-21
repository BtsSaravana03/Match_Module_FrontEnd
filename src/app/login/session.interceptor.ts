import { Injectable } from '@angular/core';
import {HttpInterceptor,HttpRequest,HttpHandler,HttpEvent,HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.router.url === '/login') {
      return next.handle(request);
    }
    if (!this.checkSession()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('Session expired'));
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  private checkSession(): boolean {
    return sessionStorage.getItem('session_mm') ? true : false;
  }
}
