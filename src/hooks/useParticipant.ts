import { useState, useEffect } from 'react';

const PARTICIPANT_STORAGE_KEY = 'raffle_participant';

export interface ParticipantData {
  participantId: string;
  id: string;      // Cédula
  name: string;
  phone: string;
  email: string;
}

/**
 * Hook para manejar los datos del participante en localStorage
 * Proporciona persistencia de datos del usuario entre sesiones
 */
export function useParticipant() {
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ParticipantData;
        setParticipant(data);
      }
    } catch (error) {
      console.error('Error al cargar datos del participante desde localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Guardar los datos del participante en localStorage
   */
  const saveParticipant = (data: ParticipantData) => {
    try {
      localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(data));
      setParticipant(data);
    } catch (error) {
      console.error('Error al guardar datos del participante en localStorage:', error);
    }
  };

  /**
   * Actualizar solo algunos campos del participante
   */
  const updateParticipant = (updates: Partial<Omit<ParticipantData, 'participantId'>>) => {
    if (!participant) return;
    
    const updatedData = { ...participant, ...updates };
    saveParticipant(updatedData);
  };

  /**
   * Limpiar los datos del participante
   */
  const clearParticipant = () => {
    try {
      localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
      setParticipant(null);
    } catch (error) {
      console.error('Error al limpiar datos del participante de localStorage:', error);
    }
  };

  return {
    participant,
    isLoading,
    saveParticipant,
    updateParticipant,
    clearParticipant,
  };
}

