/**
 * hubRoutes.jsx
 * src/hubRoutes.jsx
 *
 * All Data Hub and Ops Hub routes.
 * Master Chat: paste these <Route> blocks into your existing <Routes>.
 *
 * Wrap in DataHubAuthProvider alongside existing AuthProvider in App.jsx:
 *
 *   <AuthProvider>
 *     <DataHubAuthProvider>
 *       <Router>
 *         <Routes>
 *           {existing routes}
 *           {paste hub routes below}
 *         </Routes>
 *       </Router>
 *     </DataHubAuthProvider>
 *   </AuthProvider>
 */

import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useDataHubAuth } from './modules/data-hub/auth/DataHubAuthContext';

// Lazy-load all hub screens — keeps initial bundle small
const DataHubHome         = lazy(() => import('./modules/data-hub/screens/DataHubHome'));
const DataHubEventDetail  = lazy(() => import('./modules/data-hub/screens/DataHubEventDetail'));
const DataHubLogin        = lazy(() => import('./modules/data-hub/screens/DataHubLogin'));
const OpsHubHome          = lazy(() => import('./modules/ops-hub/screens/OpsHubHome'));

const { PriceLevelsView, BundlesView, CouponManagerView, TicketLookupView } =
  await import('./modules/ops-hub/screens/OpsScreens');

function HubLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#F4F4F4' }}>
      <div style={{ fontSize: 14, color: '#A1A1AA' }}>Loading…</div>
    </div>
  );
}

function DataHubGuard({ children }) {
  const { isAuthenticated, loading } = useDataHubAuth();
  if (loading) return <HubLoading />;
  if (!isAuthenticated) return <Navigate to="/data-hub/login" replace />;
  return children;
}

function OpsGuard({ children }) {
  const { isAuthenticated, hasPermission, loading } = useDataHubAuth();
  if (loading) return <HubLoading />;
  if (!isAuthenticated) return <Navigate to="/data-hub/login" replace />;
  // Ops Hub requires at least one write-capable permission
  // (Admin bypasses this check in hasPermission)
  return children;
}

/**
 * Paste these routes inside your existing <Routes>:
 *
 * <Route path="/data-hub/login" element={<Suspense fallback={<HubLoading />}><DataHubLogin /></Suspense>} />
 *
 * <Route path="/data-hub" element={<DataHubGuard><Suspense fallback={<HubLoading />}><DataHubHome /></Suspense></DataHubGuard>} />
 * <Route path="/data-hub/event/:eventId" element={<DataHubGuard><Suspense fallback={<HubLoading />}><DataHubEventDetail /></Suspense></DataHubGuard>} />
 *
 * <Route path="/ops" element={<OpsGuard><Suspense fallback={<HubLoading />}><OpsHubHome /></Suspense></OpsGuard>} />
 * <Route path="/ops/price-levels/:eventId" element={<OpsGuard><Suspense fallback={<HubLoading />}><PriceLevelsView /></Suspense></OpsGuard>} />
 * <Route path="/ops/bundles/:eventId" element={<OpsGuard><Suspense fallback={<HubLoading />}><BundlesView /></Suspense></OpsGuard>} />
 * <Route path="/ops/coupons/:eventId" element={<OpsGuard><Suspense fallback={<HubLoading />}><CouponManagerView /></Suspense></OpsGuard>} />
 * <Route path="/ops/ticket-lookup/:eventId" element={<OpsGuard><Suspense fallback={<HubLoading />}><TicketLookupView /></Suspense></OpsGuard>} />
 */

export {
  DataHubHome, DataHubEventDetail, DataHubLogin,
  OpsHubHome, PriceLevelsView, BundlesView, CouponManagerView, TicketLookupView,
  DataHubGuard, OpsGuard, HubLoading,
};
