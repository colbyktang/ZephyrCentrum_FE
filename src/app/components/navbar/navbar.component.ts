import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule} from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import User from '../../models/User';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  title: string = environment.title;
  isLoggedIn: boolean = false;
  user: User = {
    id: 0,
    email: '',
    username: '',
    role: '',
    createdDate: new Date()
  };
  
  private authSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;
  
  constructor(
    private storageService: StorageService, 
    private authService: AuthService, 
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to authentication state
    this.authSubscription = this.storageService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      
      if (isLoggedIn) {
        // Get user data when logged in
        this.userSubscription = this.storageService.getUser().subscribe(userData => {
          if (userData && userData.data && userData.data.user) {
            this.user = userData.data.user;
          }
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    console.log("Logged out");
    this.authService.logout().subscribe({
      next: () => {
        this.storageService.clean();
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }
}
