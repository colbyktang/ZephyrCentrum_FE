import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpErrorResponse } from '@angular/common/http';

// Error state matcher from login component
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    NavbarComponent,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  // Form controls with validation
  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20)
  ]);
  
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);
  
  confirmPasswordFormControl = new FormControl('', [
    Validators.required
  ]);

  matcher = new MyErrorStateMatcher();
  
  isRegistrationFailed = false;
  errorMessage = '';
  isSuccessful = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Nothing specific needed for initialization
  }

  // Check if passwords match
  passwordsMatch(): boolean {
    return this.passwordFormControl.value === this.confirmPasswordFormControl.value;
  }

  // Handle form submission
  onSubmit(): void {
    // If passwords don't match, show error and return
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Passwords do not match.';
      this.isRegistrationFailed = true;
      return;
    }

    const username = this.usernameFormControl.value!;
    const email = this.emailFormControl.value!;
    const password = this.passwordFormControl.value!;
    
    this.authService.register(username, email, password).subscribe({
      next: () => {
        this.isSuccessful = true;
        this.isRegistrationFailed = false;
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.isRegistrationFailed = true;
      }
    });
  }
}
