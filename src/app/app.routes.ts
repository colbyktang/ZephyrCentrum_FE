import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { environment } from '../environments/environment';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, title: `${environment.title}`},
    { path: 'login', component: LoginComponent, title: `${environment.title} - Login`},
    { path: 'register', component: RegisterComponent, title: `${environment.title} - Register`},
    { path: 'image-gallery', component: ImageGalleryComponent, title: `${environment.title} - Image Gallery`},
    { path: 'dashboard', component: DashboardComponent, title: `${environment.title} - Dashboard`},
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: '**', pathMatch: 'full', component: PagenotfoundComponent, title: `${environment.title} - Error`},
];
