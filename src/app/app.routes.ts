import { Routes } from '@angular/router';
import { CanActivateFn, Router } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Admin } from './features/admin/admin';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Profile } from './features/admin/profile/profile';
import { EditProfile } from './features/admin/profile/edit-profile/edit-profile';
import { PasswordSettings } from './features/admin/profile/password-settings/password-settings';
import { UsersList } from './features/pages/user/user-getall/users-getall';
import { RolesPermissions } from './features/pages/user/roles-permissions/roles-permissions';
import { ProductGetall } from './features/pages/product/product-getall/product-getall';
import { CategoryGetall } from './features/pages/category/category-getall/category-getall';
import { LaboratoryGetall } from './features/pages/laboratory/laboratory-getall/laboratory-getall';
import { inject } from '@angular/core';
import { Sales } from './features/sales/sales';
import { SalesDashboard } from './features/sales/sales-dashboard/sales-dashboard';
import { CurrentStock } from './features/pages/inventory/current-stock/current-stock';
import { Income } from './features/pages/inventory/income/income';
import { Movements } from './features/pages/inventory/movements/movements';
import { LotGetall } from './features/pages/lot/lot-getall/lot-getall';

const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (sessionStorage.getItem('loggedIn') === 'true') return true;
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      {
        path: 'productos', children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          { path: 'lista', component: ProductGetall }
        ]
      },
      {
        path: 'usuarios', children: [
          { path: '', redirectTo: 'lista', pathMatch: 'full' },
          { path: 'lista', component: UsersList },
          { path: 'roles-permisos', component: RolesPermissions },
        ]
      },
      {
        path: 'inventory',
        children: [
          { path: '', redirectTo: 'current-stock', pathMatch: 'full' },
          { path: 'current-stock', component: CurrentStock },
          { path: 'lots', component: LotGetall },
          { path: 'income', component: Income },
          { path: 'movements', component: Movements }
        ]
      },
      { path: 'categoria', component: CategoryGetall },
      { path: 'laboratorio', component: LaboratoryGetall },
      { path: 'profile', component: Profile },
      { path: 'profile/edit-profile', component: EditProfile },
      { path: 'profile/password-settings', component: PasswordSettings },
    ]
  },
  {
    path: 'sales',
    component: Sales,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SalesDashboard },
    ]
  }
];