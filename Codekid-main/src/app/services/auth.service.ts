import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // Your backend URL
  private tokenKey = 'authToken';
  private userSubject = new BehaviorSubject<any>(null);

  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    console.log('🔧 AuthService initialized with API URL:', this.apiUrl);
    // Don't auto-check token to avoid circular dependency with interceptor
    // Token check will be done manually when needed
  }

  private checkExistingToken(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access during SSR
    }
    
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Verify token with backend
      this.verifyToken(token).subscribe({
        next: (response) => {
          if (response.valid) {
            this.userSubject.next(response.user);
          } else {
            this.logout();
          }
        },
        error: () => this.logout()
      });
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const url = `${this.apiUrl}/login`;

    console.log('📡 Making HTTP POST request to:', url);
    console.log('📤 Request payload:', { email: credentials.email, password: '[HIDDEN]' });

    return this.http.post<any>(url, credentials, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => {
        console.log('📥 Raw response from server:', response);

        // Backend returns user object directly, handle it properly
        if (response && response.id) {
          // Store user info if browser environment
          if (isPlatformBrowser(this.platformId)) {
            // Create a simple token (could be enhanced later)
            const token = `user_${response.id}_${Date.now()}`;
            localStorage.setItem(this.tokenKey, token);
            this.userSubject.next({
              id: response.id.toString(),
              email: response.email,
              name: response.fullName
            });
            console.log('✅ Login successful, user data stored');
          }
        }
      }),
      catchError(error => {
        console.error('❌ Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterData): Observable<any> {
    const url = `${this.apiUrl}/register`;
    console.log('📡 Making HTTP POST request to:', url);
    console.log('📦 Request data:', userData);
    console.log('📦 Request data stringified:', JSON.stringify(userData));

    return this.http.post(url, userData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain'
      }),
      responseType: 'text' as 'json' // Accept text response
    }).pipe(
      tap(response => console.log('✅ Registration response:', response)),
      catchError(error => {
        console.error('❌ Registration error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error,
          fullError: error
        });
        
        // Log the specific error message from backend
        if (error.error && error.error.message) {
          console.error('🚨 Backend error message:', error.error.message);
        }
        if (error.error && error.error.errors) {
          console.error('🚨 Backend validation errors:', error.error.errors);
        }
        
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('rememberMe');
    }
    this.userSubject.next(null);
    console.log('🚪 User logged out, tokens cleared');
  }

  forgotPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/forgot-password`;
    console.log('📡 Making HTTP POST request to:', url);

    return this.http.post(url, { email }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  private verifyToken(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/verify`, { headers });
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null; // Return null during SSR
    }
    const token = localStorage.getItem(this.tokenKey);
    console.log('🔍 getToken() called, token value:', token);
    return token;
  }

  isLoggedIn(): boolean {
    const loggedIn = !!this.getToken();
    console.log('🔍 isLoggedIn() called, result:', loggedIn);
    return loggedIn;
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  // Manual token check method to avoid circular dependency
  checkAuthStatus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access during SSR
    }
    
    const token = localStorage.getItem(this.tokenKey);
    console.log('🔍 checkAuthStatus - token found:', !!token);
    
    if (token) {
      // Verify token with backend
      console.log('🔍 Attempting to verify token with backend...');
      this.verifyToken(token).subscribe({
        next: (response) => {
          console.log('🔍 Token verification response:', response);
          if (response.valid) {
            // If user data is included, use it; otherwise create a minimal user object
            const user = response.user || { 
              id: 'user_from_token', 
              email: 'user@example.com', 
              name: 'Authenticated User' 
            };
            console.log('🔍 Setting user data:', user);
            this.userSubject.next(user);
          } else {
            console.log('🔍 Token is invalid, logging out...');
            this.logout();
          }
        },
        error: (error) => {
          console.log('🔍 Token verification failed with error:', error);
          console.log('🔍 This likely means the backend server is not running');
          this.logout();
        }
      });
    } else {
      console.log('🔍 No token found, user remains logged out');
    }
  }
}
