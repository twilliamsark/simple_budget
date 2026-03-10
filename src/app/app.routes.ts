import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'transactions',
    pathMatch: 'full',
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/ui/account-list/account-list.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'accounts/new',
    loadComponent: () =>
      import('./features/accounts/ui/account-form/account-form.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'accounts/:id/edit',
    loadComponent: () =>
      import('./features/accounts/ui/account-form/account-form.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/ui/transaction-list/transaction-list.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'transactions/new',
    loadComponent: () =>
      import('./features/transactions/ui/transaction-form/transaction-form.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'transactions/:id/edit',
    loadComponent: () =>
      import('./features/transactions/ui/transaction-form/transaction-form.component').then(
        (m) => m.default
      ),
  },
  {
    path: 'transactions/import',
    loadComponent: () =>
      import('./features/transactions/ui/import-wizard/import-wizard.component').then(
        (m) => m.default
      ),
  },
];
