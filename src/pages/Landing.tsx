import { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import NavBar from '../components/site/NavBar';
import Hero from '../components/site/Hero';
import RafflesCarousel from '../components/site/RafflesCarousel';
import RaffleDetailModal from '../components/site/RaffleDetailModal';
import PrizeWinnerModal from '../components/site/PrizeWinnerModal';
import Footer from '../components/site/Footer';
import { useRaffles, getMainRaffle } from '../hooks';
import type { RaffleSummary } from '../types/raffles';
import type { Prize } from '../types/prizes';

export default function Landing() {
  const { data: raffles, isLoading, isError } = useRaffles();
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleSummary | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  const mainRaffle = useMemo(() => getMainRaffle(raffles || []), [raffles]);

  // Mock de premio para testing
  const mockPrize: Prize = {
    id: 'prize-1',
    raffleId: 'raffle-1',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    title: 'Zapatillas Nike Air Max 2024',
    shortDescription: 'Zapatillas deportivas de última generación con tecnología Air Max. Incluye caja original y garantía.',
    winningTicket: 42
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <Hero 
        raffle={mainRaffle} 
        isLoading={isLoading}
        isError={isError}
        onBuy={() => mainRaffle && setSelectedRaffle(mainRaffle)} 
      />
      <RafflesCarousel 
        raffles={raffles || []} 
        isLoading={isLoading}
        isError={isError}
      />
      <Footer />
      <RaffleDetailModal 
        raffle={selectedRaffle} 
        open={!!selectedRaffle} 
        onClose={() => setSelectedRaffle(null)} 
      />
      <PrizeWinnerModal
        prize={mockPrize}
        open={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
      />
      
      {/* Botón flotante de prueba */}
      <button
        onClick={() => setShowPrizeModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-binance-main hover:bg-binance-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="Ver premio (testing)"
      >
        <Trophy className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}


