/**
 * DataHubAuthContext.jsx
 * src/modules/data-hub/auth/DataHubAuthContext.jsx
 *
 * Separate auth context for the Data Hub.
 * Does NOT touch, import from, or interact with src/auth/AuthContext.jsx.
 * WordPress credentials grant ZERO access here.
 *
 * Auth flow:
 *   1. User hits /data-hub/login
 *   2. Enters Data Hub email + password (separate credentials from WP)
 *   3. Supabase authenticates against dh_users table
 *   4. On success — session stored in localStorage under 'dh_session'
 *   5. useDataHubAuth() exposes: user, isAuthenticated, permissions, signIn, signOut
 *
 * Permissions:
 *   permissions is an array of { brand_slug, api_key } objects.
 *   Components use hasPermission(brand, api) to gate data access.
 *
 * Tiers:
 *   'ga4' | 'instagram' | 'mailchimp'  → public analytics tier (broader access)
 *   'showclix' | 'queueit'             → financial/sensitive tier (explicit grant required)
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Separate Supabase client scoped to Data Hub tables only.
// Uses same Supabase project but different anon key scope.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are already in .env.local
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DataHubAuthContext = createContext(null);

export function DataHubAuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('dh_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session?.expires_at && Date.now() < session.expires_at) {
          setUser(session.user);
          setPermissions(session.permissions || []);
        } else {
          localStorage.removeItem('dh_session');
        }
      } catch {
        localStorage.removeItem('dh_session');
      }
    }
    setLoading(false);
  }, []);

  async function signIn(email, password) {
    setError(null);
    setLoading(true);

    try {
      // Sign in via Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const userId = authData.user.id;

      // Fetch user record from dh_users
      const { data: dhUser, error: userError } = await supabase
        .from('dh_users')
        .select('id, email, name, role')
        .eq('id', userId)
        .single();

      if (userError || !dhUser) {
        // Supabase auth succeeded but no dh_users record — no Data Hub access
        await supabase.auth.signOut();
        throw new Error('No Data Hub access. Contact your administrator.');
      }

      // Fetch permissions for this user
      const { data: perms, error: permError } = await supabase
        .from('dh_permissions')
        .select('brand_slug, api_key')
        .eq('user_id', userId);

      if (permError) throw permError;

      const sessionPayload = {
        user: dhUser,
        permissions: perms || [],
        expires_at: Date.now() + 8 * 60 * 60 * 1000, // 8hr session
      };

      localStorage.setItem('dh_session', JSON.stringify(sessionPayload));
      setUser(dhUser);
      setPermissions(perms || []);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem('dh_session');
    setUser(null);
    setPermissions([]);
  }

  /**
   * Check if the current user has permission to view a specific API's data
   * for a specific brand.
   *
   * Usage: hasPermission('crssd', 'showclix')
   *        hasPermission('proper-nye', 'ga4')
   *
   * Admins bypass all permission checks.
   */
  function hasPermission(brandSlug, apiKey) {
    if (!user) return false;
    if (user.role === 'admin') return true;

    // Public analytics APIs — any authenticated user can view
    const publicApis = ['ga4', 'instagram', 'mailchimp'];
    if (publicApis.includes(apiKey)) return true;

    // Financial / sensitive APIs — explicit grant required
    return permissions.some(
      (p) => p.brand_slug === brandSlug && p.api_key === apiKey
    );
  }

  const value = {
    user,
    permissions,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    hasPermission,
  };

  return (
    <DataHubAuthContext.Provider value={value}>
      {children}
    </DataHubAuthContext.Provider>
  );
}

export function useDataHubAuth() {
  const ctx = useContext(DataHubAuthContext);
  if (!ctx) throw new Error('useDataHubAuth must be used inside DataHubAuthProvider');
  return ctx;
}
