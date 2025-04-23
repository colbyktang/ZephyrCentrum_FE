import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service'; // Adjust path if needed

// Mock NavbarComponent (standalone)
@Component({ selector: 'app-navbar', template: '', standalone: true })
class MockNavbarComponent {}

// Mock ImageService
class MockImageService {
  uploadImage = jasmine.createSpy('uploadImage').and.returnValue(of({ url: 'mock-image-url' }));
}

// Mock StorageService (used by NavbarComponent, if applicable)
class MockStorageService {
  isLoggedIn() { return of(false); }
  getUser() { return of(null); }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let imageService: MockImageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule, // Provides HttpClient for any real service dependencies
        RouterTestingModule,     // For ActivatedRoute and Router dependencies
        HomeComponent,
        MockNavbarComponent
      ],
      providers: [
        { provide: ImageService, useClass: MockImageService },
        { provide: StorageService, useClass: MockStorageService } // Mock if NavbarComponent uses it
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService) as unknown as MockImageService;
    fixture.detectChanges();
  });

  // Test that the component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test that the welcome header is displayed
  it('should render the welcome header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Zephyr Centrum');
  });

  // Test that the "No posts yet" message is displayed when posts array is empty
  it('should display "No posts yet" when posts array is empty', () => {
    component.posts = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.posts-section p')?.textContent).toBe('No posts yet. Be the first to share!');
  });

  // Test that a text-only post is added when submitted
  it('should add a text-only post when submitted', () => {
    component.newPostText = 'Test post';
    component.submitPost();
    fixture.detectChanges();
    expect(component.posts.length).toBe(1);
    expect(component.posts[0].text).toBe('Test post');
    expect(component.posts[0].imageUrl).toBeUndefined();
    expect(component.posts[0].liked).toBeFalse();
    expect(component.posts[0].likeCount).toBe(0);
  });

  // Test that a post with an image is added when submitted
  it('should add a post with image when submitted', fakeAsync(() => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [mockFile] } } as unknown as Event;
    component.onFileChange(event);
    component.newPostText = 'Post with image';
    component.submitPost();
    tick(); // Wait for async image upload
    fixture.detectChanges();
    expect(imageService.uploadImage).toHaveBeenCalledWith(jasmine.any(FormData));
    expect(component.posts.length).toBe(1);
    expect(component.posts[0].text).toBe('Post with image');
    expect(component.posts[0].imageUrl).toBe('mock-image-url');
  }));

  // Test that a post with text exceeding 500 characters is not added
  it('should not submit a post if text exceeds 500 characters', () => {
    component.newPostText = 'a'.repeat(501); // 501 characters
    component.submitPost();
    expect(component.posts.length).toBe(0); // No post added
  });

  // Test that the like button toggles the like status and updates the count
  it('should toggle like status and update count', () => {
    const post = { text: 'Test', timestamp: new Date(), liked: false, likeCount: 0 };
    component.posts = [post];
    component.toggleLike(post);
    expect(post.liked).toBeTrue();
    expect(post.likeCount).toBe(1);
    component.toggleLike(post);
    expect(post.liked).toBeFalse();
    expect(post.likeCount).toBe(0);
  });

  // Test that the form is reset after submission
  it('should reset form after submission', () => {
    component.newPostText = 'Test post';
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    component.newPostImage = mockFile;
    component.submitPost();
    expect(component.newPostText).toBe('');
    expect(component.newPostImage).toBeNull();
  });

  // Test that the character count is displayed correctly
  it('should display character count', () => {
    // Ensure newPostText is initialized as a string
    component.newPostText = ''; // Explicitly set to empty string
    fixture.detectChanges();
    component.newPostText = 'Hello';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.char-count')?.textContent).toBe('5 / 500');
  });

  /** Test that edit mode can be toggled and changes saved locally */
  it('should toggle edit mode and save changes', () => {
    const post = { text: 'Test', timestamp: new Date(), liked: false, likeCount: 0, isEditing: false };
    component.posts = [post];
    fixture.detectChanges();

    component.editPost(post); // Enter edit mode
    expect(post.isEditing).toBeTrue();

    post.text = 'Edited Test'; // Simulate user edit
    component.editPost(post); // Save changes
    expect(post.isEditing).toBeFalse();
    expect(component.posts[0].text).toBe('Edited Test');
  });

  /** Test that a post can be deleted from the list */
  it('should delete a post', () => {
    const post = { text: 'Test', timestamp: new Date(), liked: false, likeCount: 0, isEditing: false };
    component.posts = [post];
    fixture.detectChanges();

    component.deletePost(post); // Remove the post
    expect(component.posts.length).toBe(0);
  });
});
