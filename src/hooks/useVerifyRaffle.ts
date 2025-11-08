import { useState, useCallback } from 'react';
import { rafflesService } from '../services/raffles';
import { prizesService } from '../services/prizes';
import { isRaffleFinished } from '../utils/raffles';
import type { RaffleSummary, RaffleVerifyRequest, RaffleVerifyResult, RaffleVerifyTicket } from '../types/raffles';
import type { Prize } from '../types/prizes';

export type VerifyResultState =
  | { type: 'idle' }
  | { type: 'no-tickets' }
  | { type: 'tickets-no-prizes-active'; tickets: RaffleVerifyTicket[] }
  | { type: 'tickets-no-prizes-finished'; tickets: RaffleVerifyTicket[]; mainWinners: number[]; blessWinners: number[] }
  | { type: 'tickets-with-prizes'; tickets: RaffleVerifyTicket[]; winningTickets: RaffleVerifyTicket[] };

export function useVerifyRaffle() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResultState>({ type: 'idle' });

  const verify = useCallback(async (raffle: RaffleSummary, documentId: string) => {
    setIsVerifying(true);
    setError(null);
    setResult({ type: 'idle' });

    try {
      // 1. Verificar tickets comprados
      const verifyRequest: RaffleVerifyRequest = {
        raffleId: raffle.id,
        documentId: documentId.trim(),
      };

      const verifyResult: RaffleVerifyResult = await rafflesService.verifyRaffle(verifyRequest);

      // Escenario 1: Sin tickets comprados
      if (!verifyResult.boughtTickets || verifyResult.boughtTickets.length === 0) {
        const noTicketsResult = { type: 'no-tickets' as const };
        setResult(noTicketsResult);
        console.log('Resultado de verificación:', verifyResult);
        console.log('Rifa ID:', verifyResult.raffleId);
        console.log('Documento:', verifyResult.documentId);
        console.log('Tickets comprados:', verifyResult.boughtTickets);
        return;
      }

      // Separar tickets con premios y sin premios
      const winningTickets = verifyResult.boughtTickets.filter(
        t => t.isMainPrize || t.isBlessNumber
      );
      const regularTickets = verifyResult.boughtTickets.filter(
        t => !t.isMainPrize && !t.isBlessNumber
      );

      // Escenario 3: Tiene tickets con premios
      if (winningTickets.length > 0) {
        const withPrizesResult = {
          type: 'tickets-with-prizes' as const,
          tickets: verifyResult.boughtTickets,
          winningTickets,
        };
        setResult(withPrizesResult);
        console.log('Resultado de verificación:', verifyResult);
        console.log('Rifa ID:', verifyResult.raffleId);
        console.log('Documento:', verifyResult.documentId);
        console.log('Tickets comprados:', verifyResult.boughtTickets);
        console.log('Tickets ganadores:', winningTickets);
        return;
      }

      // Escenario 2: Tiene tickets pero sin premios
      const isFinished = isRaffleFinished(raffle);

      if (!isFinished) {
        // Rifa aún activa
        const activeResult = {
          type: 'tickets-no-prizes-active' as const,
          tickets: verifyResult.boughtTickets,
        };
        setResult(activeResult);
        console.log('Resultado de verificación:', verifyResult);
        console.log('Rifa ID:', verifyResult.raffleId);
        console.log('Documento:', verifyResult.documentId);
        console.log('Tickets comprados:', verifyResult.boughtTickets);
        return;
      }

      // Rifa culminada - obtener tickets ganadores del backend
      try {
        const [mainWinners, blessWinners] = await Promise.all([
          rafflesService.getMainWinnerTickets(raffle.id),
          rafflesService.getBlessNumberWinnerTickets(raffle.id),
        ]);

        const finishedResult = {
          type: 'tickets-no-prizes-finished' as const,
          tickets: verifyResult.boughtTickets,
          mainWinners,
          blessWinners,
        };
        setResult(finishedResult);
        console.log('Resultado de verificación:', verifyResult);
        console.log('Rifa ID:', verifyResult.raffleId);
        console.log('Documento:', verifyResult.documentId);
        console.log('Tickets comprados:', verifyResult.boughtTickets);
        console.log('Tickets ganadores principales:', mainWinners);
        console.log('Tickets ganadores bless:', blessWinners);
      } catch (err) {
        // Error al obtener tickets ganadores
        const errorMessage = err instanceof Error ? err.message : 'Error al obtener los números ganadores';
        throw new Error(`No se pudo verificar el resultado. ${errorMessage}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar. Por favor, intenta nuevamente.';
      setError(errorMessage);
      setResult({ type: 'idle' });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const getPrizeForTicket = useCallback(async (
    raffle: RaffleSummary,
    ticket: RaffleVerifyTicket
  ): Promise<Prize | null> => {
    try {
      if (ticket.isMainPrize) {
        // Para el premio principal, crear el objeto premio con datos de la rifa
        console.log('Obteniendo premio principal para ticket:', ticket.ticketNumber);
        const mainPrize: Prize = {
          id: `main-prize-${raffle.id}`,
          raffleId: raffle.id,
          imageUrl: raffle.coverImageUrl,
          title: raffle.title,
          shortDescription: raffle.shortDescription,
          winningTicket: ticket.ticketNumber,
          isMainPrize: true,
        };
        console.log('Premio principal creado:', mainPrize);
        return mainPrize;
      }

      if (ticket.isBlessNumber) {
        // Para bless numbers, obtener del servicio
        console.log('Obteniendo premio bless para ticket:', ticket.ticketNumber, 'en rifa:', raffle.id);
        const blessPrize = await prizesService.getPrizeByRaffleIdAndTicketId(
          raffle.id,
          ticket.ticketNumber
        );
        console.log('Premio bless obtenido:', blessPrize);
        
        if (!blessPrize) {
          console.warn('No se encontró premio bless para ticket:', ticket.ticketNumber);
        }
        
        return blessPrize;
      }

      console.warn('Ticket no tiene premio (ni main ni bless):', ticket);
      return null;
    } catch (err) {
      console.error('Error al obtener premio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Detalles del error:', errorMessage);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setResult({ type: 'idle' });
    setError(null);
  }, []);

  return {
    verify,
    getPrizeForTicket,
    reset,
    isVerifying,
    error,
    result,
  };
}

