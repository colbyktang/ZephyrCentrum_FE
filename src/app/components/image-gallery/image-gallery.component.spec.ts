import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageGalleryComponent } from './image-gallery.component';
import { ImageService } from '../../services/image.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('ImageGalleryComponent', () => {
  let component: ImageGalleryComponent;
  let fixture: ComponentFixture<ImageGalleryComponent>;
  let imageService: jasmine.SpyObj<ImageService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ImageService', ['uploadImage', 'updateVisibility', 'getUserImages']);
    await TestBed.configureTestingModule({
      imports: [ImageGalleryComponent, CommonModule],
      providers: [{ provide: ImageService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageGalleryComponent);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService) as jasmine.SpyObj<ImageService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user images on init', () => {
    const mockImages = [
      { url: 'test-url-1', visibility: 'public' },
      { url: 'test-url-2', visibility: 'private' }
    ];
    imageService.getUserImages.and.returnValue(of(mockImages));
    
    component.ngOnInit();
    
    expect(imageService.getUserImages).toHaveBeenCalled();
    expect(component.images).toEqual(mockImages);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading images', () => {
    imageService.getUserImages.and.returnValue(throwError(() => new Error('Error')));
    
    component.ngOnInit();
    
    expect(imageService.getUserImages).toHaveBeenCalled();
    expect(component.loadError).toBeTruthy();
    expect(component.isLoading).toBeFalse();
  });

  it('should process valid image file and upload', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file], value: '' } } as any;
    imageService.uploadImage.and.returnValue(of({ url: 'test-url' }));

    component.onFileChange(event);
    expect(imageService.uploadImage).toHaveBeenCalled();
    expect(component.images).toContain({ url: 'test-url', visibility: 'private' });
  });

  it('should alert on invalid file type', () => {
    spyOn(window, 'alert');
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: '' } } as any;

    component.onFileChange(event);
    expect(window.alert).toHaveBeenCalledWith('Only images (JPEG, PNG, GIF) are allowed.');
  });

  it('should update visibility', () => {
    component.images = [{ url: 'test-url', visibility: 'private' }];
    imageService.updateImage.and.returnValue(of(undefined));
    const event = { target: { value: 'public' } } as any;

    component.changeVisibility(0, event);
    expect(component.images[0].visibility).toBe('public');
    expect(imageService.updateImage).toHaveBeenCalledWith({ url: 'test-url', visibility: 'public' });
  });
});
