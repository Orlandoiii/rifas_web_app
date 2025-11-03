import { useEffect, useState } from 'react';
import NavBar from '../components/site/NavBar';
import Hero from '../components/site/Hero';
import RafflesCarousel from '../components/site/RafflesCarousel';
import RaffleDetailModal from '../components/site/RaffleDetailModal';
import Footer from '../components/site/Footer';
import { rafflesService } from '../services/raffles';
import type { RaffleSummary } from '../types/raffles';

export default function Landing() {
  const [current, setCurrent] = useState<RaffleSummary | null>(null);
  const [raffles, setRaffles] = useState<RaffleSummary[]>([]);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const [c, r] = await Promise.all([
        rafflesService.getCurrentRaffle(controller.signal),
        rafflesService.getRaffles(controller.signal)
      ]);
      setCurrent(c);
      setRaffles(r);
    })();
    return () => controller.abort();
  }, []);

  const handleOpenDetail = (raffleId: string) => {
    setOpenDetailId(raffleId);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <Hero raffle={current} onBuy={() => current && handleOpenDetail(current.id)} />
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


