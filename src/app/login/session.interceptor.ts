import { Injectable } from '@angular/core';
import {HttpInterceptor,HttpRequest,HttpHandler,HttpEvent,HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  constructor(private router: Router,private location: Location) {
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currentUrl = this.location.path();
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
    const matchId = urlParams.get('matchid');
    if (matchId) {
      sessionStorage.setItem('currentMatchId', matchId);
    }
    if (this.router.url === '/login') {
      return next.handle(request);
    }
    else{
        if (!this.checkSession()) {
            this.router.navigate(['/login']);
            return throwError(() => new Error('Session expired'));
          }
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
