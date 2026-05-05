/**
 * data-hub-routes.jsx
 *
 * Routes to add to the existing React Router config.
 * Master Chat: paste these inside your existing <Routes> block.
 * Wrap the entire app in <DataHubAuthProvider> at the root level —
 * ideally inside App.jsx alongside the existing <AuthProvider>.
 *
 * IMPORTANT: DataHubAuthProvider is completely separate from AuthProvider.
 * Do not nest one inside the other in a way that creates a dependency.
 * They are siblings, not parent/child.
 *
 * Example App.jsx structure:
 *
 *   <AuthProvider>           ← existing, untouched
 *     <DataHubAuthProvider>  ← new, wraps entire app so /data-hub/* routes work
 *       <Router>
 *         <Routes>
 *           ... existing routes ...
 *           ... paste data hub routes below ...
 *         </Routes>
 *       </Router>
 *     </DataHubAuthProvider>
 *   </AuthProvider>
 */

import { Route } from 'react-router-dom';
import { DataHubAuthProvider } from './src/modules/data-hub/auth/DataHubAuthContext';
import { DataHubLogin }        from './src/modules/data-hub/screens/DataHubLogin';
import { DataHubGate }         from './src/modules/data-hub/screens/DataHubGate';

// Lazy-load the heavier Data Hub screens — don't bloat the initial bundle
import { lazy } from 'react';
const DataHubHome        = lazy(() => import('./src/modules/data-hub/screens/DataHubHome'));
const DataHubEventDetail = lazy(() => import('./src/modules/data-hub/screens/DataHubEventDetail'));
const DataHubMetricDetail= lazy(() => import('./src/modules/data-hub/screens/DataHubMetricDetail'));
const DataHubAllBrands   = lazy(() => import('./src/modules/data-hub/screens/DataHubAllBrands'));

/**
 * Paste these <Route> elements into your existing <Routes> block:
 *
 *   <Route path="/data-hub/login" element={<DataHubLogin />} />
 *
 *   <Route path="/data-hub" element={<DataHubGate />}>
 *     <Route index               element={<DataHubHome />} />
 *     <Route path="all-brands"   element={<DataHubAllBrands />} />
 *     <Route path="event/:id"    element={<DataHubEventDetail />} />
 *     <Route path="event/:id/:metric" element={<DataHubMetricDetail />} />
 *   </Route>
 */

// DataHubGate — auth guard, equivalent to existing PrivateRoute pattern
// src/modules/data-hub/screens/DataHubGate.jsx

/**
 * DataHubGate.jsx
 *
 * Protects all /data-hub/* routes.
 * If not authenticated → redirect to /data-hub/login.
 * Does NOT check WP auth. Only checks DataHubAuthContext.
 */
export function DataHubGate() {
  const { isAuthenticated, loading } = useDataHubAuth();
  const location = useLocation();

  if (loading) return <div className="dh__loading">Loading…</div>;

  if (!isAuthenticated) {
    return <Navigate to="/data-hub/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
