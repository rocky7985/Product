import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/common.service';

export const dataGuard: CanActivateFn = (route, state) => {

  const commonService = inject(CommonService);
  const router = inject(Router);

  const userData = localStorage.getItem('login');
  const isHardRefresh = localStorage.getItem('isRefreshed') == 'true';

  // If this is a hard refresh on the 'cart' page, redirect to 'home'
  if (isHardRefresh && route.url.find(segment => segment.path === 'cart')) {
    localStorage.removeItem('isRefreshed'); // Clear the flag after detection
    router.navigate(['/home']);
    return false; // Prevent navigation to 'cart' page
  }


  if (userData) {
    return true; // Data is available, allow navigation
  } else {
    router.navigate(['/login']); // Redirect to login page
    commonService.presentToast('Not Authenticated');
    return false; // Prevent navigation
  }

};

window.addEventListener('beforeunload', () => {
  localStorage.setItem('isRefreshed', 'true');
});