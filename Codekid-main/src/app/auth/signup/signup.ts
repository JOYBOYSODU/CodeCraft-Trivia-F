import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true, // ✅ Add this
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [CommonModule, ReactiveFormsModule] // ✅ Required for forms and *ngIf
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get fullName() {
    return this.signupForm.get('fullName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      console.log('❌ Form is invalid, cannot submit');
      console.log('Form errors:', this.signupForm.errors);
      console.log('Form controls:', {
        fullName: this.fullName?.errors,
        email: this.email?.errors,
        password: this.password?.errors
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.disableForm();

    const { fullName, email, password } = this.signupForm.value;

    // Try different data formats that backends commonly expect
    const userData = {
      fullName: fullName?.trim(),
      email: email?.trim().toLowerCase(),
      password: password
    };

    console.log('📝 Form values extracted:', { fullName, email, password: password ? '[PROVIDED]' : '[MISSING]' });
    console.log('📦 Final userData object:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.enableForm();
        console.log('Registration successful:', response);

        // Redirect to login page after successful registration
        this.router.navigate(['/auth'], {
          queryParams: { message: 'Registration successful! Please log in.' }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.enableForm();
        console.error('Registration failed:', error);
        console.error('Error details:', error.error);

        // Handle 201 status (success but JSON parsing failed)
        if (error.status === 201) {
          console.log('🎉 Registration successful! (Status 201 but JSON parsing failed)');
          this.router.navigate(['/auth'], {
            queryParams: { message: 'Registration successful! Please log in.' }
          });
          return;
        }

        // Handle different types of errors
        if (error.status === 400) {
          // Try to get specific error message from backend
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Handle validation errors array
            const errorMessages = Object.values(error.error.errors).flat();
            this.errorMessage = errorMessages.join(', ');
          } else {
            this.errorMessage = 'Invalid registration data. Please check your inputs.';
          }
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Please check if the server is running and CORS is configured properly.';
        } else if (error.status === 409) {
          this.errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running at localhost:8080.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  enableForm() {
    this.signupForm.enable();
  }

  disableForm() {
    this.signupForm.disable();
  }


}
