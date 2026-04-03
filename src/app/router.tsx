import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RequireAuth } from "../features/auth/RequireAuth";
import { RequireRole } from "../features/auth/RequireRole";
import { CompanyScope } from "../features/companies/CompanyScope";
import { CompanyRootRedirect } from "../features/companies/CompanyRootRedirect";
import { PostLoginRedirect } from "../features/companies/PostLoginRedirect";
import { CompanyLayout } from "../components/CompanyLayout";
import { SuperAdminLayout } from "../components/SuperAdminLayout";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NewSalePage } from "../pages/seller/NewSalePage";
import { SellerProductsPage } from "../pages/seller/SellerProductsPage";
import { SellerSalesPage } from "../pages/seller/SellerSalesPage";
import { AdminCompaniesPage } from "../pages/super/AdminCompaniesPage";
import { AdminCompanyEditPage } from "../pages/super/AdminCompanyEditPage";
import { AdminCompanyNewPage } from "../pages/super/AdminCompanyNewPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminInventoryPage } from "../pages/admin/AdminInventoryPage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { AdminSalesPage } from "../pages/admin/AdminSalesPage";
import { AdminSellersPage } from "../pages/admin/AdminSellersPage";
import { AdminInventoryCategoriesPage } from "../pages/admin/inventory/AdminInventoryCategoriesPage";
import { AdminInventoryProductPage } from "../pages/admin/inventory/AdminInventoryProductPage";
import { AdminInventoryProductNewPage } from "../pages/admin/inventory/AdminInventoryProductNewPage";
import { AdminInventoryProductsPage } from "../pages/admin/inventory/AdminInventoryProductsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      { index: true, element: <PostLoginRedirect /> },
      {
        path: "admin",
        element: <RequireRole anyOf={["SUPER_ADMIN"]} />,
        children: [
          {
            element: <SuperAdminLayout />,
            children: [
              { index: true, element: <Navigate to="companies" replace /> },
              { path: "companies", element: <AdminCompaniesPage /> },
              { path: "companies/new", element: <AdminCompanyNewPage /> },
              { path: "companies/:id/edit", element: <AdminCompanyEditPage /> }
            ]
          }
        ]
      },
      {
        path: "companies/:companySlug",
        element: <CompanyScope />,
        children: [
          {
            element: <CompanyLayout />,
            children: [
              { index: true, element: <CompanyRootRedirect /> },
              {
                path: "admin",
                element: <RequireRole anyOf={["STORE_ADMIN"]} />,
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  { path: "dashboard", element: <AdminDashboardPage /> },
                  {
                    path: "sales",
                    element: <Outlet />,
                    children: [
                      { index: true, element: <Navigate to="list" replace /> },
                      { path: "list", element: <AdminSalesPage /> },
                      { path: "new", element: <NewSalePage /> }
                    ]
                  },
                  {
                    path: "inventory",
                    element: <AdminInventoryPage />,
                    children: [
                      { index: true, element: <Navigate to="products" replace /> },
                      { path: "categories", element: <AdminInventoryCategoriesPage /> },
                      { path: "products", element: <AdminInventoryProductsPage /> },
                      { path: "products/new", element: <AdminInventoryProductNewPage /> },
                      { path: "products/:productId", element: <AdminInventoryProductPage /> },
                      { path: "variants", element: <Navigate to="../products" replace /> },
                      { path: "stock-adjust", element: <Navigate to="../products" replace /> }
                    ]
                  },
                  { path: "reports", element: <AdminReportsPage /> },
                  { path: "reports/daily", element: <AdminReportsPage /> },
                  { path: "reports/top-products", element: <AdminReportsPage /> },
                  { path: "reports/seller-performance", element: <AdminReportsPage /> },
                  { path: "users/sellers", element: <AdminSellersPage /> },
                  { path: "users/sellers/new", element: <AdminSellersPage /> }
                ]
              },
              {
                path: "seller",
                element: <RequireRole anyOf={["SELLER"]} />,
                children: [
                  { index: true, element: <Navigate to="sales/new" replace /> },
                  { path: "sales", element: <SellerSalesPage /> },
                  { path: "sales/new", element: <NewSalePage /> },
                  { path: "products", element: <SellerProductsPage /> }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <NotFoundPage /> }
]);
