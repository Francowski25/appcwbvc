import { Routes } from '@angular/router';
import { CanActivateFn, Router } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Admin } from './features/admin/admin';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Profile } from './features/admin/profile/profile';
import { UsersList } from './features/pages/user/user-getall/users-getall';
import { RolesPermissions } from './features/pages/user/roles-permissions/roles-permissions';
import { ProductGetall } from './features/pages/product/product-getall/product-getall';
import { CategoryGetall } from './features/pages/category/category-getall/category-getall';
import { LaboratoryGetall } from './features/pages/laboratory/laboratory-getall/laboratory-getall';
import { inject } from '@angular/core';
import { CurrentStock } from './features/pages/inventory/current-stock/current-stock';
import { Income } from './features/pages/inventory/income/income';
import { Movements } from './features/pages/inventory/movements/movements';
import { LotGetall } from './features/pages/lot/lot-getall/lot-getall';
import { PurchaseGetall } from './features/pages/purchases/purchase-getall/purchase-getall';
import { SupplierGetall } from './features/pages/supplier/supplier-getall/supplier-getall';
import { Seller } from './features/seller/seller';
import { SellerDashboard } from './features/seller/seller-dashboard/seller-dashboard';
import { SalesGetall } from './features/pages/sales/sales-getall/sales-getall';
import { SalesNew } from './features/pages/sales/sales-new/sales-new';
import { CustomerGetall } from './features/pages/customer/customer-getall/customer-getall';
import { ReportPurchases } from './features/pages/reports/report-purchases/report-purchases';
import { ReportSales } from './features/pages/reports/report-sales/report-sales';
import { ReportInventory } from './features/pages/reports/report-inventory/report-inventory';
import { ReportCustomers } from './features/pages/reports/report-customers/report-customers';
import { Warehouse } from './features/pages/inventory/warehouse/warehouse';

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
      {
        path: 'purchases',
        children: [
          { path: '', redirectTo: 'historial', pathMatch: 'full' },
          { path: 'historial', component: PurchaseGetall },
          { path: 'proveedor', component: SupplierGetall },
        ]
      },
      {
        path: 'ventas',
        children: [
          { path: '', redirectTo: 'nueva', pathMatch: 'full' },
          { path: 'nueva', component: SalesNew },
          { path: 'historial', component: SalesGetall }
        ]
      },
      {
        path: 'clientes',
        children: [
          { path: '', redirectTo: '', pathMatch: 'full' },
          { path: '', component: CustomerGetall },
        ]
      },
      {
        path: 'reports',
        children: [
          { path: '', redirectTo: 'sales', pathMatch: 'full' },
          { path: 'sales', component: ReportSales },
          { path: 'inventory', component: ReportInventory },
          { path: 'purchases', component: ReportPurchases },
          { path: 'customers', component: ReportCustomers },
        ]
      },
      { path: 'categoria', component: CategoryGetall },
      { path: 'laboratorio', component: LaboratoryGetall },
      { path: 'profile', component: Profile },
      { path: 'almacen', component: Warehouse },
      { path: 'alertas', component: CurrentStock }
    ]
  },
  {
    path: 'seller',
    component: Seller,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SellerDashboard },
      { path: 'sales/new', component: SalesNew },
      { path: 'sales/history', component: SalesGetall },
      { path: 'customers', component: CustomerGetall },
      /*{ path: 'products', component: ProductGetall },*/
      { path: 'inventory/current-stock', component: CurrentStock },
      { path: 'profile', component: Profile },
    ]
  }
];