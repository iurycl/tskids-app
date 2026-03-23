import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/product-list/product-list.page').then(m => m.ProductListPage)
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
