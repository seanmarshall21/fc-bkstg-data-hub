/**
 * DataHubEntryPoint.jsx
 * 
 * Renders the Data Hub entry tile on the app home screen.
 * Sits alongside the existing Event Hub tile — does not replace or modify it.
 * Only visible when activeSite.data_hub_enabled === true.
 * 
 * Placement: wherever the existing Event Hub entry tile is rendered on the home screen.
 * Master Chat determines exact placement in the home layout.
 * 
 * Auth: clicking this navigates to /data-hub/login — a separate login flow.
 * WP credentials are NOT checked here. Data Hub has its own auth.
 */

import { useNavigate } from 'react-router-dom';
import { useDataHubAuth } from '../modules/data-hub/auth/DataHubAuthContext';

export function DataHubEntryPoint({ site }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useDataHubAuth();

  if (!site?.data_hub_enabled) return null;

  function handlePress() {
    if (isAuthenticated) {
      navigate('/data-hub');
    } else {
      navigate('/data-hub/login');
    }
  }

  return (
    <button
      className="dh__entry-tile"
      onClick={handlePress}
      aria-label="Open Data Hub"
    >
      <div className="dh__entry-tile-icon">
        {/* Chart icon — replace with your existing icon system */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity="0.75" />
          <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
        </svg>
      </div>
      <div className="dh__entry-tile-label">Data Hub</div>
      <div className="dh__entry-tile-sub">Analytics &amp; Reports</div>
    </button>
  );
}
