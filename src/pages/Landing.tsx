import { useState, useMemo } from 'react';
import NavBar from '../components/site/NavBar';
import Hero from '../components/site/Hero';
import RafflesCarousel from '../components/site/RafflesCarousel';
import RaffleDetailModal from '../components/site/RaffleDetailModal';
import Footer from '../components/site/Footer';
import { useRaffles, getMainRaffle } from '../hooks';

export default function Landing() {
  const { data: raffles = [], isLoading } = useRaffles();
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  const mainRaffle = useMemo(() => getMainRaffle(raffles), [raffles]);

  const handleOpenDetail = (raffleId: string) => {
    setOpenDetailId(raffleId);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <Hero 
        raffle={mainRaffle} 
        isLoading={isLoading}
        onBuy={() => mainRaffle && handleOpenDetail(mainRaffle.id)} 
      />
      <RafflesCarousel raffles={raffles} />
      <Footer />
      <RaffleDetailModal 
        raffleId={openDetailId} 
        open={!!openDetailId} 
        onClose={() => setOpenDetailId(null)} 
      />
    </div>
  );
}


