import { Button } from '../../components/lib/components/button';
import { Loader } from '../../components/lib/components/loader';
import { useWithLoaderAsync } from '../../components/lib/components/modal/load_modal/loadModalStore';
import type { CurrentRaffle } from '../../types/raffles';

interface HeroProps {
  raffle: CurrentRaffle | null;
}

export default function Hero({ raffle }: HeroProps) {
  const withLoaderAsync = useWithLoaderAsync();

  const progress = raffle
    ? Math.min(100, Math.round((raffle.ticketsSold / Math.max(1, raffle.ticketsTotal)) * 100))
    : 0;

  const handleBuy = async () => {
    await withLoaderAsync(async () => new Promise(r => setTimeout(r, 600)), 'Abriendo compra...');
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-center bg-cover"
          style={{ backgroundImage: `url('/hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-bg-primary/70 to-bg-primary/80" />
      </div>

      <div className="relative mx-auto max-w-7xl w-full px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center md:-translate-y-6 lg:-translate-y-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Bienvenido a las mejores rifas
          </h1>
          <p className="mt-4 text-text-secondary md:text-lg lg:text-xl">
            Participa de forma rápida y segura. ¡Grandes premios te esperan!
          </p>
        </div>

        <div className="mt-8 md:mt-12 max-w-3xl lg:max-w-4xl mx-auto">
          {raffle ? (
            <div className="bg-bg-secondary/80 backdrop-blur-sm border border-border-light rounded-2xl p-5 md:p-7 lg:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start">
                <img
                  src={raffle.coverImageUrl}
                  alt={raffle.title}
                  className="w-full md:w-64 lg:w-72 h-44 md:h-40 lg:h-48 object-cover rounded-lg border border-border-light"
                />
                <div className="flex-1 text-left">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">{raffle.title}</h2>
                  <p className="text-text-secondary text-sm md:text-base lg:text-lg">{raffle.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-selected font-semibold text-base md:text-lg">
                      {raffle.price.toFixed(2)} {raffle.currency} / ticket
                    </span>
                    <span className="text-text-muted text-sm md:text-base">
                      Termina: {new Date(raffle.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full h-2.5 lg:h-3 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-selected" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-text-muted text-xs md:text-sm mt-1">
                      {raffle.ticketsSold.toLocaleString()} / {raffle.ticketsTotal.toLocaleString()} vendidos
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleBuy} className="w-full md:w-auto lg:text-base lg:h-12 lg:px-8">Comprar ahora</Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-secondary/80 border border-border-light rounded-2xl p-5 max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                <Loader size="sm" />
                <div>
                  <p className="text-text-primary font-medium">Cargando rifa vigente...</p>
                  <p className="text-text-secondary text-sm">Explora nuestras rifas disponibles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


