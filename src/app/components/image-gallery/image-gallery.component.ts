import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';
import { StorageService } from '../../services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../navbar/navbar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, NavbarComponent],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css'],
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  // Array to store uploaded images with their URLs and visibility settings
  images: { url: string; visibility: string }[] = [];
  // Maximum file size allowed (2MB in bytes)
  maxFileSize = 2 * 1024 * 1024;
  // Allowed image MIME types for upload
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  // Loading state for initial image fetch
  isLoading = true;
  // Error message for image loading
  loadError = '';
  // Authentication status
  isLoggedIn = false;
  private subscription = new Subscription();

  constructor(
    private imageService: ImageService,
    private storageService: StorageService,
    private router: Router
  ) {
    // Check if user is logged in
    this.checkLoginStatus();
  }

  // Load user images when component initializes
  ngOnInit(): void {
    // Update authentication status
    this.checkLoginStatus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkLoginStatus(): void {
    this.subscription.add(
      this.storageService.isLoggedIn().subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        
        if (this.isLoggedIn) {
          this.loadUserImages();
        } else {
          this.isLoading = false;
        }
      })
    );
  }

  // Redirect to login page
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Fetches all images for the current user
  loadUserImages(): void {
    this.isLoading = true;
    this.imageService.getUserImages().subscribe({
      next: (images) => {
        this.images = images;
        this.isLoading = false;
      },
      error: (error) => {
        this.loadError = 'Failed to load images. Please try again later.';
        this.isLoading = false;
        console.error('Error loading images:', error);
      }
    });
  }

  // Handles file input change event and processes selected files
  onFileChange(event: Event): void {
    // Do nothing if user is not logged in
    if (!this.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.processFiles(files);
    input.value = ''; // Reset input for subsequent uploads
  }

  // Processes each file in the list
  private processFiles(files: File[]): void {
    for (const file of files) {
      this.processFile(file);
    }
  }

  // Validates and prepares a single file for upload
  private processFile(file: File): void {
    if (!this.isValidFile(file)) return;

    const formData = this.createFormData(file);
    this.uploadImage(formData);
  }

  // Checks if a file meets type and size requirements
  private isValidFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      alert('Only images (JPEG, PNG, GIF) are allowed.');
      return false;
    }
    if (file.size > this.maxFileSize) {
      alert('File size exceeds 2MB limit.');
      return false;
    }
    return true;
  }

  // Creates FormData object for file upload
  private createFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('visibility', 'private'); // Default visibility
    return formData;
  }

  // Uploads image to server and updates images array on success
  private uploadImage(formData: FormData): void {
    // Double-check authentication before upload
    if (!this.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    this.imageService.uploadImage(formData).subscribe({
      next: (response) => this.images.push({ url: response.url, visibility: 'private' }),
      error: () => alert('Upload failed. Please try again.'),
    });
  }

  // Updates visibility of an image based on user selection
  changeVisibility(index: number, event: Event): void {
    // Only logged in users can change visibility
    if (!this.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const visibility = (event.target as HTMLSelectElement).value;
    this.images[index].visibility = visibility;
    this.updateVisibilityOnServer(this.images[index]);
  }

  // Sends visibility update to the server
  private updateVisibilityOnServer(image: { url: string; visibility: string }): void {
    this.imageService.updateImage(image).subscribe({
      error: () => alert('Failed to update visibility.'),
    });
  }
}
