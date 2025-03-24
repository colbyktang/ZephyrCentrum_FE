import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  clean(): void {
    if (this.isBrowser) {
      window.sessionStorage.clear();
    }
  }

  public saveUser(user: any): void {
    if (this.isBrowser) {
      window.sessionStorage.removeItem(environment.API_URL);
      window.sessionStorage.setItem(environment.API_URL, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (this.isBrowser) {
      const user = window.sessionStorage.getItem(environment.API_URL);
      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  public isLoggedIn(): boolean {
    if (this.isBrowser) {
      const user = window.sessionStorage.getItem(environment.API_URL);
      if (user) {
        return true;
      }
    }
    return false;
  }
}
