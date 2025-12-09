import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../../components/lib/components/button';
import { usePurchases } from '../../hooks';

interface NavBarProps {
  whatsappNumber?: string; // E.164 sin '+' ej: 584121234567
}


// function OldLogo() {
//   return (
//     <svg
//       width="40"
//       height="40"
//       viewBox="0 0 100 100"
//       xmlns="http://www.w3.org/2000/svg"
//       style={{ transform: 'rotate(45deg)' }}
//     >
//       <g fill="var(--color-selected)">
//         <circle cx="50" cy="25" r="18" />
//         <circle cx="75" cy="50" r="18" />
//         <circle cx="50" cy="75" r="18" />
//         <circle cx="25" cy="50" r="18" />
//         <circle cx="50" cy="50" r="12" />
//         <rect x="48" y="68" width="4" height="20" rx="2" />
//       </g>

//       <g fill="var(--color-selected-light)" opacity="0.3">
//         <ellipse cx="45" cy="20" rx="6" ry="4" />
//         <ellipse cx="70" cy="45" rx="4" ry="6" />
//         <ellipse cx="55" cy="70" rx="6" ry="4" />
//         <ellipse cx="30" cy="55" rx="4" ry="6" />
//       </g>
//     </svg>
//   );
// }

// Subcomponentes locales
function Logo() {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <Link to="/" className="flex items-center gap-3 cursor-pointer select-none" onClick={handleClick}>
      <div className={`transition-transform duration-500 ease-in-out ${isSpinning ? 'rotate-360' : ''}`}>
        <img 
          src="/logo-recortado.png" 
          alt="Logo" 
          className="w-12 h-12 object-contain"
        />
      </div>

      <img 
        src="/letras-recortadas.png" 
        alt="TuSorteo Ganador" 
        className="h-8 object-contain"
      />
    </Link>
  );
}

export default function NavBar({ whatsappNumber = '584242972112' }: NavBarProps) {
  const { hasPurchases, purchases } = usePurchases();

  return (
    <nav className="sticky top-0 z-40 bg-bg-secondary border-b border-border-light/60 backdrop-blur supports-backdrop-filter:bg-bg-secondary/80">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          {hasPurchases && (
            <Link
              to="/mis-compras"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mis Compras</span>
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-mint-main text-white rounded-full">
                {purchases.length}
              </span>
            </Link>
          )}
          {hasPurchases && (
            <Link
              to="/mis-compras"
              className="sm:hidden relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
              title="Mis Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {purchases.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-mint-main text-white rounded-full">
                  {purchases.length}
                </span>
              )}
            </Link>
          )}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, deseo información sobre las rifas')}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button className="hidden sm:inline-flex">Contáctanos</Button>
            <Button className="sm:hidden px-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </Button>
          </a>
        </div>
      </div>
    </nav>
  );
}


