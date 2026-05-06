/**
 * PATCH: siteRegistry.js additions for Data Hub — Phase 1
 *
 * Instructions for Master Chat:
 * Add `data_hub_enabled` to each site entry in the existing siteRegistry.js.
 * Default is false for all sites. Only set to true when credentials are in place.
 * Do NOT change any other field in the registry entries.
 *
 * Current deploy order mirrors plugin rollout:
 *   Proper NYE → true (Phase 1 test)
 *   All others  → false (no change in behavior)
 */

// ── ADD this field to each site object in siteRegistry.js ──
// Example diff for Proper NYE entry:
//
// {
//   name: 'Proper NYE',
//   slug: 'proper-nye',
//   registrySlug: 'proper-nye',
//   url: 'https://www.propernye.com',
//   // ... existing fields unchanged ...
//   data_hub_enabled: true,   // ← ADD (only Proper NYE gets true for now)
// }
//
// All other sites:
//   data_hub_enabled: false,  // ← ADD (no behavior change, just flag)

export const DATA_HUB_SITES = {
  'proper-nye':      true,
  'zoo-agency':      false,
  'crssd-fest':      false,
  'led':             false,
  'sd-rodeo':        false,
  'outriders':       false,
  'crssd':           false,
  'utbs':            false,
  'wild-horses':     false,
};

// Helper — import and call in Dashboard.jsx where activeSite is read
export function siteHasDataHub(registrySlug) {
  return DATA_HUB_SITES[registrySlug] === true;
}
