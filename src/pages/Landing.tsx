import { useEffect, useState } from 'react';
import NavBar from '../components/site/NavBar';
import Hero from '../components/site/Hero';
import RafflesCarousel from '../components/site/RafflesCarousel';
import Footer from '../components/site/Footer';
import { rafflesService } from '../services/raffles';
import type { CurrentRaffle, RaffleSummary } from '../types/raffles';

export default function Landing() {
  const [current, setCurrent] = useState<CurrentRaffle | null>(null);
  const [raffles, setRaffles] = useState<RaffleSummary[]>([]);

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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <Hero raffle={current} />
      <RafflesCarousel raffles={raffles} />
      <Footer />
    </div>
  );
}


