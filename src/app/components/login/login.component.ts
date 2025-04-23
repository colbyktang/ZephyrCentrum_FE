import { Component, OnInit } from '@angular/core';
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
import { StorageService } from '../../services/storage.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpErrorResponse } from '@angular/common/http';

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
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    NavbarComponent,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  userFormControl = new FormControl('', [Validators.required]);
  passFormControl = new FormControl('', [Validators.required]);

  matcher = new MyErrorStateMatcher();

  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router : Router
  ) {}

  ngOnInit(): void {
    // Check login status
    this.storageService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.storageService.getUser().subscribe(userData => {
          if (userData && userData.data && userData.data.user) {
            this.roles = userData.data.user.role ? [userData.data.user.role] : [];
          }
        });
      }
    });
  }

  onSubmit(): void {
    const username = this.userFormControl.value!;
    const password = this.passFormControl.value!;
    this.authService
      .login(username, password)
      .subscribe({
        next: (data) => {
          this.storageService.saveUser(data);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          
          this.storageService.getUser().subscribe(userData => {
            if (userData && userData.data && userData.data.user) {
              this.roles = userData.data.user.role ? [userData.data.user.role] : [];
            }
          });
          
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message;
          this.isLoginFailed = true;
        },
      });
  }
}
