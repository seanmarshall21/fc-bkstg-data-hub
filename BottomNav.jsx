/**
 * BottomNav.jsx
 * src/modules/data-hub/components/BottomNav.jsx
 *
 * Shared bottom navigation. Matches the exact design from the app home screen:
 * dark navy pill, icon + label, active state on Home.
 */

import { useNavigate } from 'react-router-dom';
import { color, font, radius, space } from '../../../styles/tokens';

const NAV_ITEMS = [
  { id: 'home',   label: 'Home',     icon: '⊞',  path: '/'          },
  { id: 'search', label: 'Search',   icon: '◎',  path: '/search'    },
  { id: 'add',    label: 'Add Site', icon: '+',   path: '/add'       },
  { id: 'favs',   label: 'Favorites',icon: '⚑',  path: '/favorites' },
  { id: 'status', label: 'Status',   icon: '◉',  path: '/status'    },
];

export function BottomNav({ active }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      padding: `${space.md}px ${space.md}px ${space.xl}px`,
      pointerEvents: 'none',
    }}>
      <div style={{
        backgroundColor: color.bottomNav,
        borderRadius: radius.xl,
        padding: `${space.sm}px ${space.sm}px`,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        pointerEvents: 'all',
        boxShadow: '0 4px 24px rgba(17,24,28,0.24)',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, background: 'none', border: 'none', cursor: 'pointer',
                padding: `${space.xs}px ${space.sm}px`,
                borderRadius: radius.md,
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                minWidth: 52,
              }}
            >
              <span style={{
                fontSize: 18,
                color: isActive ? color.white : 'rgba(255,255,255,0.5)',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 9, fontWeight: isActive ? '600' : '400',
                color: isActive ? color.white : 'rgba(255,255,255,0.5)',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
