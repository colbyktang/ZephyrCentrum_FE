import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Component for the home page, managing social media-style posts with text, images, likes, and editing capabilities.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  /** Array of posts, each with text, optional image URL, timestamp, like status, count, and editing state */
  posts: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number, isEditing?: boolean }[] = [];
  /** Text content for a new post */
  newPostText: string = '';
  /** Image file for a new post */
  newPostImage: File | null = null;

  constructor(private imageService: ImageService) {}

  /** Handles file selection for image uploads */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newPostImage = input.files[0];
    }
  }

  /** Submits a new post, uploading an image if provided */
  submitPost(): void {
    if ((!this.newPostText && !this.newPostImage) || this.newPostText.length > 500) return;

    const post: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number, isEditing?: boolean } = { 
      text: this.newPostText, 
      timestamp: new Date(),
      liked: false,
      likeCount: 0,
      isEditing: false // Initialize as not editing
    };

    if (this.newPostImage) {
      const formData = new FormData();
      formData.append('image', this.newPostImage);
      formData.append('visibility', 'public');

      this.imageService.uploadImage(formData).subscribe({
        next: (response) => {
          post.imageUrl = response.url;
          this.addPost(post);
        },
        error: () => alert('Image upload failed. Post saved without image.'),
        complete: () => this.resetForm()
      });
    } else {
      this.addPost(post);
      this.resetForm();
    }
  }

  /** Adds a post to the posts array */
  private addPost(post: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number, isEditing?: boolean }): void {
    this.posts.unshift(post); // New posts appear at the top
  }

  /** Toggles the like status of a post and updates its like count */
  toggleLike(post: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number }): void {
    post.liked = !post.liked;          // Toggle liked state
    post.likeCount += post.liked ? 1 : -1; // Increment or decrement like count
  }

  /** Resets the post creation form */
  private resetForm(): void {
    this.newPostText = '';
    this.newPostImage = null;
  }

  /** Updates character count display (currently a placeholder) */
  updateCharCount(): void {
    // No additional logic needed since ngModel updates newPostText.length automatically
    // Included for potential future enhancements (e.g., custom validation)
  }

  /** Toggles editing mode for a post or saves changes locally */
  editPost(post: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number, isEditing?: boolean }): void {
    if (post.isEditing) {
      // Save changes by exiting edit mode (local only, no backend update)
      post.isEditing = false;
    } else {
      // Enter edit mode to allow text modification
      post.isEditing = true;
    }
  }

  /** Deletes a post from the posts array */
  deletePost(post: { text: string, imageUrl?: string, timestamp: Date, liked?: boolean, likeCount: number, isEditing?: boolean }): void {
    const index = this.posts.indexOf(post);
    if (index > -1) {
      this.posts.splice(index, 1); // Remove the post from the array
    }
  }
}
