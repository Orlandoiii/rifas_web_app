import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '../components/lib/components/loader';
import NavBar from '../components/site/NavBar';
import Footer from '../components/site/Footer';
import VerifyRaffleDetails from '../components/site/VerifyRaffleDetails';
import VerifyRaffleForm from '../components/site/VerifyRaffleForm';
import { useRaffles } from '../hooks';
import type { RaffleSummary } from '../types/raffles';

export default function VerifyRaffle() {
  const { raffleId } = useParams<{ raffleId: string }>();
  const navigate = useNavigate();
  const { data: raffles, isLoading } = useRaffles();
  const [raffle, setRaffle] = useState<RaffleSummary | null>(null);

  useEffect(() => {
    if (raffles && raffleId) {
      const found = raffles.find(r => r.id === raffleId);
      if (found) {
        setRaffle(found);
      } else if (!isLoading) {
        // Si no se encuentra la rifa y ya terminó de cargar, redirigir
        navigate('/', { replace: true });
      }
    }
  }, [raffles, raffleId, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Rifa no encontrada</h2>
            <p className="text-text-secondary mb-4">La rifa que buscas no existe o ha sido eliminada.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-mint-main hover:bg-mint-dark text-white font-semibold rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <NavBar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Sección de detalles de la rifa */}
          <VerifyRaffleDetails raffle={raffle} />
          
          {/* Sección de formulario de verificación */}
          <VerifyRaffleForm raffle={raffle} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

