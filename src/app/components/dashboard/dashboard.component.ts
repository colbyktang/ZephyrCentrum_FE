import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import User from '../../models/User';
import { NavbarComponent } from "../navbar/navbar.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    const authSub = this.storageService.isLoggedIn().subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
    });

    // Subscribe to user data
    const userSub = this.storageService.getUser().subscribe(userData => {
      if (userData && userData.data && userData.data.user) {
        this.currentUser = userData.data.user;
        this.isLoading = false;
      } else {
        this.errorMessage = 'User data not found';
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    });

    this.subscriptions.push(authSub, userSub);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
