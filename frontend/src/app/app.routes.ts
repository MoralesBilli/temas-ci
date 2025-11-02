import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'alumnos', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login-page/login-page').then(c => c.LoginPage),
    title: 'Login',
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register-page/register-page').then(c => c.RegisterPage),
    title: 'Registro',
    canActivate: [guestGuard]
  },
  {
    path: 'alumnos',
    loadComponent: () => import("./alumnos/alumnos-page/alumnos-page").then(c => c.AlumnosPage),
    title: 'Alumnos',
    canActivate: [authGuard]
  },
  {
    path: 'calidad',
    loadComponent: () => import("./calidad/calidad-page/calidad-page").then(c => c.CalidadPage),
    title: 'Calidad',
    canActivate: [authGuard]
  }
];
