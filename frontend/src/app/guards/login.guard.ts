import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('streamToken');

  if (token) {
    router.navigate(['/']); // redirection vers la page principale
    return false; // bloque l’accès à /login
  }

  return true; // autorise l’accès à /login si pas connecté
};
