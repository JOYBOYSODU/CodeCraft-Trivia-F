import { Component, Inject, PLATFORM_ID, AfterViewInit, ElementRef, ViewChild, OnDestroy, OnInit, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, LoginCredentials } from '../services/auth.service';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {
  // Use { static: false } as the canvas is only accessed in ngAfterViewInit.
  @ViewChild('bladeTrail', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private animationFrameId?: number;
  private ctx?: CanvasRenderingContext2D;
  private points: TrailPoint[] = [];
  private readonly maxPoints = 25;
  private lastMouseTime = 0;
  private width = 0;
  private height = 0;

  // BEST PRACTICE: Use a Subscription object to manage all subscriptions.
  private componentSubscriptions = new Subscription();

  // FIX: Store bound event listener functions to properly remove them later.
  private _onResize!: () => void;
  private _onMouseMove!: (e: MouseEvent) => void;
  private _onMouseOut!: () => void;

  private readonly isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    console.log('AuthComponent constructor called');
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [{ value: false, disabled: false }]
    });

    // Use afterNextRender for browser-only auth check
    afterNextRender(() => {
      console.log('AuthComponent afterNextRender called');
      
      // Check if there's a token first
      const hasToken = this.authService.getToken();
      console.log('🔍 AuthComponent - Has token:', !!hasToken);
      
      if (!hasToken) {
        console.log('No token found, showing auth form immediately');
        return; // Stay on auth page
      }
      
      // If there's a token, subscribe to auth state changes to wait for validation
      let hasChecked = false;
      const authSubscription = this.authService.user$.subscribe(user => {
        console.log('🔍 AuthComponent - User state changed:', user);
        if (user) {
          console.log('User is authenticated, redirecting to home...');
          this.router.navigate(['/']);
        } else if (hasChecked) {
          // Only log this if we've already triggered the check
          // This means the token was invalid and user was logged out
          console.log('Token validation failed, staying on auth page');
        }
      });
      
      this.componentSubscriptions.add(authSubscription);
      
      // Trigger auth status check (this will validate the token)
      hasChecked = true;
      this.authService.checkAuthStatus();
    });
  }

  ngOnInit(): void {
    // FIX: Initialize bound functions once.
    if (this.isBrowser) {
        this._onResize = this.onResize.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseOut = this.onMouseOut.bind(this);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.setupCanvas();
      this.addEventListeners();
      this.startBladeTrail();
    }
  }

  ngOnDestroy(): void {
    // BEST PRACTICE: Unsubscribe from all subscriptions to prevent memory leaks.
    this.componentSubscriptions.unsubscribe();

    if (this.isBrowser) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      // FIX: Ensure event listeners are correctly removed.
      this.removeEventListeners();
    }
  }

  // Getter methods for cleaner template access
  get email(): AbstractControl | null { return this.loginForm.get('email'); }
  get password(): AbstractControl | null { return this.loginForm.get('password'); }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.updateCanvasSize();
  }

  private updateCanvasSize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  private addEventListeners(): void {
    // FIX: Add the pre-bound function references.
    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseout', this._onMouseOut);
  }

  private removeEventListeners(): void {
    // FIX: Remove the exact same function references.
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseout', this._onMouseOut);
  }

  private onResize(): void {
    this.updateCanvasSize();
  }

  private onMouseMove(e: MouseEvent): void {
    this.lastMouseTime = Date.now();
    this.points.push({ x: e.clientX, y: e.clientY, alpha: 1 });
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  private onMouseOut(): void {
    this.lastMouseTime = Date.now() - 2000; // Trigger fade out
  }

  private startBladeTrail(): void {
    const drawTrail = () => {
      if (!this.ctx) return;

      if (Date.now() - this.lastMouseTime > 1000) {
        this.points.length = 0;
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const opacity = p1.alpha;
        const lineWidth = 12 * (1 - i / this.maxPoints) + 1;

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        this.ctx.shadowColor = "white";
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();

        p1.alpha *= 0.92;
      }

      while (this.points.length > 0 && this.points[0].alpha < 0.05) {
        this.points.shift();
      }

      this.animationFrameId = requestAnimationFrame(drawTrail);
    };
    drawTrail();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      console.log('⚠️ Form is invalid or already loading');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.disable();

    const { email, password, rememberMe } = this.loginForm.getRawValue();
    const credentials: LoginCredentials = { email, password };

    const loginSub = this.authService.login(credentials).subscribe({
      next: (response: any) => {
        console.log('✅ Login successful:', response);
        // Backend returns user object directly
        if (response && response.id) {
          this.successMessage = `Welcome back, ${response.fullName || 'Coder'}!`;
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          // Set flag to auto-play videos after login
          localStorage.setItem('autoPlayVideos', 'true');
          // Redirect to home page
          setTimeout(() => this.router.navigate(['/']), 1500);
        } else {
          this.handleLoginError({ message: 'Login failed - invalid response' });
        }
      },
      error: (error) => {
        console.error('❌ Login failed with error:', error);
        this.handleLoginError(error);
      },
    });

    this.componentSubscriptions.add(loginSub);
  }

  private handleLoginError(error: any): void {
      if (error.status === 0) {
        this.errorMessage = 'Cannot connect to server. Is the backend running?';
      } else if (error.status === 401) {
        this.errorMessage = 'Invalid email or password.';
      } else if (error.status === 404) {
        this.errorMessage = 'User not found. Please register first.';
      } else if (error.status === 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = error.error?.message || error.message || 'An unknown error occurred.';
      }
      this.isLoading = false;
      this.loginForm.enable();
  }

  onForgotPassword(): void {
    const emailControl = this.loginForm.get('email');
    if (!emailControl?.valid) {
      this.errorMessage = 'Please enter a valid email address first.';
      emailControl?.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();

    const forgotPasswordSub = this.authService.forgotPassword(emailControl.value).subscribe({
      next: (response) => {
        console.log('📧 Password reset email request sent:', response);
        this.successMessage = 'Password reset instructions sent to your email.';
        this.isLoading = false;
        this.loginForm.enable();
      },
      error: (error) => {
        console.error('❌ Forgot password failed:', error);
        this.errorMessage = 'Failed to send password reset email. Please try again.';
        this.isLoading = false;
        this.loginForm.enable();
      }
    });

    this.componentSubscriptions.add(forgotPasswordSub);
  }
}
