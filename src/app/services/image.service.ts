import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  apiUrl = `${environment.API_URL}/images`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private csrfService: CsrfService
  ) { }

  // Get all images for the current user
  getUserImages(): Observable<{ url: string; visibility: string }[]> {
    return this.http.get<{ url: string; visibility: string }[]>(`${this.apiUrl}/user/${this.authService.currentUser.id}`);
  }

  // Get image by id
  getImageById(id: string): Observable<{ url: string; visibility: string }> {
    return this.http.get<{ url: string; visibility: string }>(`${this.apiUrl}/${id}`);
  }

  // Upload image
  uploadImage(formData: FormData): Observable<{ url: string }> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        let headers = new HttpHeaders();
        if (csrfToken) {
          headers = headers.set('X-CSRF-TOKEN', csrfToken);
        }
        
        return this.http.post<{ url: string }>(
          `${this.apiUrl}/upload`, 
          formData,
          { 
            headers,
            withCredentials: true 
          }
        );
      })
    );
  }

  // Update image
  updateImage(image: { url: string; visibility: string }): Observable<void> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        let headers = new HttpHeaders();
        if (csrfToken) {
          headers = headers.set('X-CSRF-TOKEN', csrfToken);
        }
        
        return this.http.patch<void>(
          `${this.apiUrl}/images/${this.authService.currentUser.id}`, 
          image,
          { 
            headers,
            withCredentials: true 
          }
        );
      })
    );
  }

  // Delete image
  deleteImage(id: string): Observable<void> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        let headers = new HttpHeaders();
        if (csrfToken) {
          headers = headers.set('X-CSRF-TOKEN', csrfToken);
        }
        
        return this.http.delete<void>(
          `${this.apiUrl}/${id}`,
          { 
            headers,
            withCredentials: true 
          }
        );
      })
    );
  }
}
