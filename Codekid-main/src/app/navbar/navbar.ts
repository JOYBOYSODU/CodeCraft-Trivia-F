import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  sidebarOpen: boolean = false;
  progress: number = 48;
  profileDropdownOpen: boolean = false;
  isLoggedIn: boolean = false;
  currentUser: any = null;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth status changes
    this.authSubscription = this.authService.user$.subscribe(user => {
      console.log('Auth state changed - User:', user);
      this.currentUser = user;
      this.isLoggedIn = !!user;
      console.log('Auth state - isLoggedIn:', this.isLoggedIn);
    });
    
    // Check initial auth status
    console.log('Checking initial auth status...');
    this.authService.checkAuthStatus();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    // Close profile dropdown when opening sidebar
    this.profileDropdownOpen = false;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    // Close sidebar when opening profile dropdown
    if (this.profileDropdownOpen) {
      this.sidebarOpen = false;
    }
  }

  closeProfileDropdown(): void {
    this.profileDropdownOpen = false;
  }

  onBeginnerClick(): void {
    console.log('Beginner level selected');
    this.closeSidebar();
    this.router.navigate(['/beginner']);
  }

  onIntermediateClick(): void {
    console.log('Intermediate level selected');
    this.closeSidebar();
    this.router.navigate(['/intermediate']);
  }

  onAdvancedClick(): void {
    console.log('Advanced level selected');
    this.closeSidebar();
    this.router.navigate(['/advance']);
  }


  onProfileClick(): void {
    if (this.isLoggedIn) {
      this.toggleProfileDropdown();
    } else {
      // If not logged in, redirect to login
      this.onLoginClick();
    }
  }

  onLoginClick(): void {
    console.log('Login button clicked!');
    console.log('Current isLoggedIn state:', this.isLoggedIn);
    console.log('Current router state:', this.router.url);
    
    try {
      this.router.navigate(['/auth']).then(success => {
        console.log('Navigation result:', success);
        if (success) {
          console.log('Successfully navigated to /auth');
        } else {
          console.error('Navigation to /auth failed');
        }
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } catch (error) {
      console.error('Router navigation exception:', error);
    }
    
    this.closeProfileDropdown();
  }

  onLogoutClick(): void {
    console.log('Logout clicked');
    this.authService.logout();
    this.closeProfileDropdown();
    this.router.navigate(['/']);
  }

  onViewProfileClick(): void {
    console.log('View profile clicked');
    // TODO: Navigate to profile page when implemented
    this.closeProfileDropdown();
  }
}
