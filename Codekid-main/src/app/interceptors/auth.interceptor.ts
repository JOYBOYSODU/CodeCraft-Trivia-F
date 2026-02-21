import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token directly from localStorage to avoid circular dependency
    const token = localStorage.getItem('authToken');

    // Add auth header if token exists
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Add content-type header for API requests
    if (req.url.includes('/api/')) {
      authReq = authReq.clone({
        headers: authReq.headers.set('Content-Type', 'application/json')
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          console.log('🔒 Unauthorized access - redirecting to login');
          // Clear tokens directly to avoid circular dependency
          localStorage.removeItem('authToken');
          localStorage.removeItem('rememberMe');
          this.router.navigate(['/auth']);
        }

        return throwError(() => error);
      })
    );
  }
}
