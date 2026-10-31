import { lazy } from 'react';
import { BrowserRouter, Navigate, useRoutes, type RouteObject } from 'react-router';
import AppLayout from '@/shared/components/layout/AppLayout';

// Each page becomes its own chunk, downloaded the first time its route is visited.
const HomePage = lazy(() => import('../pages/Home'));
const CompanyPage = lazy(() => import('../pages/Company'));
const ContractPage = lazy(() => import('../pages/Contract'));
const SellerPage = lazy(() => import('../pages/Seller'));

export const routes: RouteObject[] = [
    {
        element: <AppLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'empresas', element: <CompanyPage /> },
            { path: 'contratos', element: <ContractPage /> },
            { path: 'vendedores', element: <SellerPage /> },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
];

export function AppRouteTree() {
    return useRoutes(routes);
}

const AppRoutes = () => {
    return (
        // Navigations run inside startTransition (default in v7), keeping the current page on screen while the next page's chunk downloads.
        <BrowserRouter>
            <AppRouteTree />
        </BrowserRouter>
    );
};

export default AppRoutes;
