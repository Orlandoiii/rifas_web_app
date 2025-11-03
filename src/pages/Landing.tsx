import { useState, useMemo } from 'react';
import NavBar from '../components/site/NavBar';
import Hero from '../components/site/Hero';
import RafflesCarousel from '../components/site/RafflesCarousel';
import RaffleDetailModal from '../components/site/RaffleDetailModal';
import Footer from '../components/site/Footer';
import { useRaffles, getMainRaffle } from '../hooks';
import type { RaffleSummary } from '../types/raffles';

export default function Landing() {
  const { data: raffles, isLoading, isError } = useRaffles();
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleSummary | null>(null);

  const mainRaffle = useMemo(() => getMainRaffle(raffles || []), [raffles]);

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
    </div>
  );
}


