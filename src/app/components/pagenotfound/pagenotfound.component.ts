import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.css'
})
export class PagenotfoundComponent {
  current_path: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.current_path = isPlatformBrowser(this.platformId) ? window.location.href : 'N/A';
  }
}