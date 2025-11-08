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
  const [verifyingRaffle, setVerifyingRaffle] = useState<RaffleSummary | null>(null);

  const mainRaffle = useMemo(() => getMainRaffle(raffles || []), [raffles]);

  const handleVerify = () => {
    // TODO: Implementar lógica de verificación de resultados
    // Por ahora, abrimos un modal simple
    if (mainRaffle) {
      setVerifyingRaffle(mainRaffle);
    }
  };

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
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Hero 
          raffle={mainRaffle} 
          isLoading={isLoading}
          isError={isError}
          onBuy={() => mainRaffle && setSelectedRaffle(mainRaffle)}
          onVerify={handleVerify}
        />
        <RafflesCarousel 
          raffles={raffles || []} 
          isLoading={isLoading}
          isError={isError}
        />
      </div>
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
      
      {/* Modal de verificación - TODO: Implementar vista de resultados */}
      {verifyingRaffle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setVerifyingRaffle(null)}>
          <div className="bg-bg-secondary rounded-xl p-6 max-w-md w-full mx-4 border border-border-light" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-text-primary mb-2">Verificar Resultados</h3>
            <p className="text-text-secondary mb-4">
              La funcionalidad de verificación de resultados estará disponible próximamente.
            </p>
            <button
              onClick={() => setVerifyingRaffle(null)}
              className="w-full px-4 py-2 bg-mint-main hover:bg-mint-dark text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
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


