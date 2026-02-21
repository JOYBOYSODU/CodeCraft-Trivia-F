import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', loadComponent: () => import('./auth/auth').then(m => m.AuthComponent) },
  { path: 'login', loadComponent: () => import('./auth/auth').then(m => m.AuthComponent) },
  { path: 'auth/signup', loadComponent: () => import('./auth/signup/signup').then(m => m.SignupComponent) },
  { path: 'signup', loadComponent: () => import('./auth/signup/signup').then(m => m.SignupComponent) },
  { path: 'beginner', loadComponent: () => import('./beginner/beginner').then(m => m.BeginnerComponent) },

  // Beginner Lesson Routes
  {
    path: 'beginner/lesson1',
    loadComponent: () => import('./beginner/component/lesson1/lesson1').then(m => m.Lesson1Component)
  },
  {
    path: 'beginner/lesson2',
    loadComponent: () => import('./beginner/component/lesson2/lesson2').then(m => m.Lesson2Component)
  },
  {
    path: 'beginner/lesson3',
    loadComponent: () => import('./beginner/component/lesson3/lesson3').then(m => m.Lesson3Component)
  },
  {
    path: 'beginner/lesson4',
    loadComponent: () => import('./beginner/component/lesson4/lesson4').then(m => m.Lesson4Component)
  },
  {
    path: 'beginner/lesson5',
    loadComponent: () => import('./beginner/component/lesson5/lesson5').then(m => m.Lesson5Component)
  },
  {
    path: 'beginner/lesson6',
    loadComponent: () => import('./beginner/component/lesson6/lesson6').then(m => m.Lesson6Component)
  },
  {
    path: 'beginner/lesson7',
    loadComponent: () => import('./beginner/component/lesson7/lesson7').then(m => m.Lesson7Component)
  },
  {
    path: 'beginner/lesson8',
    loadComponent: () => import('./beginner/component/lesson8/lesson8').then(m => m.Lesson8Component)
  },

  { path: '**', redirectTo: '' }
];
