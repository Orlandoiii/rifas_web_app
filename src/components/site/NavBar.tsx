import { Button } from '../../components/lib/components/button';
import { useTheme } from '../../components/lib/components/theme';

interface NavBarProps {
  whatsappNumber?: string; // E.164 sin '+' ej: 584121234567
}

// Subcomponentes locales
function Logo() {
  return (
    <div className="w-32 h-8 rounded bg-selected/20 border border-selected/30 text-selected flex items-center justify-center text-sm font-semibold">
      LOGO
    </div>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div id="changeThemeButton" className="cursor-pointer p-2 rounded-md hover:bg-bg-tertiary transition-colors" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <svg id="sunIcon" className={isDark ? 'hidden' : ''} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8959_2447)">
          <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="var(--color-icon-primary)" strokeOpacity="1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M12 1V3" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M12 21V23" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M4.22021 4.22L5.64021 5.64" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18.3599 18.36L19.7799 19.78" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M1 12H3" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M21 12H23" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M4.22021 19.78L5.64021 18.36" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18.3599 5.64L19.7799 4.22" stroke="var(--color-icon-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </g>
        <defs>
          <clipPath id="clip0_8959_2447">
            <rect width="24" height="24" fill="var(--color-icon-primary)"></rect>
          </clipPath>
        </defs>
      </svg>
      <svg id="moonIcon" className={isDark ? '' : 'hidden'} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.9999 12.79C20.8426 14.4922 20.2038 16.1144 19.1581 17.4668C18.1125 18.8192 16.7034 19.8458 15.0956 20.4265C13.4878 21.0073 11.7479 21.1181 10.0794 20.7461C8.41092 20.3741 6.8829 19.5345 5.67413 18.3258C4.46536 17.117 3.62584 15.589 3.25381 13.9205C2.88178 12.252 2.99262 10.5121 3.57336 8.9043C4.15411 7.29651 5.18073 5.88737 6.53311 4.84175C7.8855 3.79614 9.5077 3.15731 11.2099 3C10.2133 4.34827 9.73375 6.00945 9.85843 7.68141C9.98312 9.35338 10.7038 10.9251 11.8893 12.1106C13.0748 13.2961 14.6465 14.0168 16.3185 14.1415C17.9905 14.2662 19.6516 13.7866 20.9999 12.79Z" stroke="var(--color-icon-primary)" strokeOpacity="1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    </div>
  );
}

export default function NavBar({ whatsappNumber = '584121234567' }: NavBarProps) {

  return (
    <nav className="sticky top-0 z-40 bg-bg-secondary border-b border-border-light/60 backdrop-blur supports-backdrop-filter:bg-bg-secondary/80">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, deseo información sobre las rifas')}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button>Contáctanos</Button>
          </a>
        </div>
      </div>
    </nav>
  );
}


