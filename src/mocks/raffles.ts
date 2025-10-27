import type { CurrentRaffle, RaffleSummary } from '../types/raffles';

export const mockCurrentRaffle: CurrentRaffle = {
  id: 'r-001',
  title: 'Rifa iPhone 15 Pro',
  shortDescription: 'Participa y gana un iPhone 15 Pro',
  coverImageUrl: 'https://images.unsplash.com/photo-1661961110944-4f8f3e4b935e?q=80&w=1200&auto=format&fit=crop',
  price: 3,
  currency: 'USD',
  ticketsTotal: 5000,
  ticketsSold: 2021,
  endsAt: new Date(Date.now() + 1000*60*60*24*7).toISOString(),
  highlight: true
};

export const mockRaffles: RaffleSummary[] = [
  {
    id: 'r-002',
    title: 'PlayStation 5',
    shortDescription: 'La consola de nueva generación',
    coverImageUrl: 'https://images.unsplash.com/photo-1606813907291-76a36003a1b6?q=80&w=1200&auto=format&fit=crop',
    price: 2.5,
    currency: 'USD',
    ticketsTotal: 3000,
    ticketsSold: 950,
    endsAt: new Date(Date.now() + 1000*60*60*24*14).toISOString(),
  },
  {
    id: 'r-003',
    title: 'Moto Scooter',
    shortDescription: 'Movilidad urbana eficiente',
    coverImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
    price: 4,
    currency: 'USD',
    ticketsTotal: 2000,
    ticketsSold: 600,
    endsAt: new Date(Date.now() + 1000*60*60*24*20).toISOString(),
  },
  {
    id: 'r-004',
    title: 'MacBook Air M2',
    shortDescription: 'Potencia y portabilidad',
    coverImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    price: 5,
    currency: 'USD',
    ticketsTotal: 4000,
    ticketsSold: 1234,
    endsAt: new Date(Date.now() + 1000*60*60*24*10).toISOString(),
  },
  {
    id: 'r-005',
    title: 'iPad Pro',
    shortDescription: 'Creatividad sin límites',
    coverImageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb2?q=80&w=1200&auto=format&fit=crop',
    price: 3.5,
    currency: 'USD',
    ticketsTotal: 2500,
    ticketsSold: 2100,
    endsAt: new Date(Date.now() + 1000*60*60*24*5).toISOString(),
  },
];


