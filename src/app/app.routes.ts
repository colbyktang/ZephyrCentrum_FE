import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { environment } from '../environments/environment';
import { LoginComponent } from './components/login/login.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, title: `${environment.title}`},
    { path: 'login', component: LoginComponent, title: `${environment.title} - Login`},
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: '**', pathMatch: 'full', component: PagenotfoundComponent, title: `${environment.title} - Error`}
];
