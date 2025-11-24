import { useState, useEffect, useCallback } from 'react';
import type { PurchaseSuccessData } from '../components/site/PurchaseSuccessView';

const LOCAL_STORAGE_KEY = 'raffle_purchases';
const STORAGE_EVENT = 'purchases_updated';
const EXPIRATION_DAYS = 7; // Las compras expiran después de 7 días

// Interfaz extendida para incluir timestamp
interface PurchaseWithTimestamp extends PurchaseSuccessData {
  savedAt: number; // Timestamp en milisegundos
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseSuccessData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para limpiar compras expiradas (más de 7 días)
  const cleanExpiredPurchases = useCallback((purchasesWithTimestamp: PurchaseWithTimestamp[]): PurchaseSuccessData[] => {
    const now = Date.now();
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    
    return purchasesWithTimestamp
      .filter(p => {
        const age = now - p.savedAt;
        return age < expirationTime;
      })
      .map(({ savedAt, ...purchase }) => purchase); // Remover savedAt del resultado
  }, []);

  // Función para cargar compras desde localStorage
  const loadPurchases = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const purchasesWithTimestamp: PurchaseWithTimestamp[] = Array.isArray(parsed) ? parsed : [];
        
        // Limpiar compras expiradas
        const validPurchases = cleanExpiredPurchases(purchasesWithTimestamp);
        
        // Si se eliminaron compras expiradas, guardar la lista actualizada
        if (validPurchases.length !== purchasesWithTimestamp.length) {
          const updatedWithTimestamp = validPurchases.map(p => ({
            ...p,
            savedAt: purchasesWithTimestamp.find(pt => pt.transactionId === p.transactionId)?.savedAt || Date.now()
          }));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWithTimestamp));
        }
        
        setPurchases(validPurchases);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error al parsear compras desde localStorage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setPurchases([]);
    }
  }, [cleanExpiredPurchases]);

  // Cargar compras al montar
  useEffect(() => {
    loadPurchases();
    setIsLoading(false);
  }, [loadPurchases]);

  // Escuchar cambios en localStorage (para sincronizar entre componentes)
  useEffect(() => {
    const handleStorageChange = () => {
      loadPurchases();
    };

    // Listener personalizado para cambios internos
    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageChange);
    };
  }, [loadPurchases]);

  // Guardar una nueva compra
  const savePurchase = useCallback((purchase: PurchaseSuccessData) => {
    // Cargar compras actuales con timestamps desde localStorage
    let currentPurchasesWithTimestamp: PurchaseWithTimestamp[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        currentPurchasesWithTimestamp = Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error al cargar compras para guardar:', error);
    }

    // Verificar si ya existe una compra con el mismo transactionId
    const existingIndex = currentPurchasesWithTimestamp.findIndex(
      p => p.transactionId === purchase.transactionId
    );
    
    let updated: PurchaseWithTimestamp[];
    if (existingIndex >= 0) {
      // Si ya existe, actualizar la compra existente manteniendo el timestamp original
      console.log('Compra ya existe, actualizando:', purchase.transactionId);
      updated = [...currentPurchasesWithTimestamp];
      updated[existingIndex] = {
        ...purchase,
        savedAt: updated[existingIndex].savedAt // Mantener el timestamp original
      };
    } else {
      // Si no existe, agregar al inicio con timestamp actual
      updated = [
        { ...purchase, savedAt: Date.now() },
        ...currentPurchasesWithTimestamp
      ];
    }
    
    // Limpiar compras expiradas antes de guardar
    const validPurchases = cleanExpiredPurchases(updated);
    
    // Guardar con timestamps (necesarios para la expiración)
    // Mapear las compras válidas de vuelta a PurchaseWithTimestamp
    const validPurchasesWithTimestamp = validPurchases.map(p => {
      const existing = updated.find(up => up.transactionId === p.transactionId);
      return {
        ...p,
        savedAt: existing?.savedAt || Date.now()
      };
    });
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validPurchasesWithTimestamp));
    
    // Actualizar el estado sin timestamps
    setPurchases(validPurchases);
    
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [cleanExpiredPurchases]);

  // Obtener una compra por transactionId
  const getPurchaseById = useCallback((transactionId: string): PurchaseSuccessData | null => {
    return purchases.find(p => p.transactionId === transactionId) || null;
  }, [purchases]);

  // Limpiar todas las compras (útil para testing)
  const clearPurchases = useCallback(() => {
    setPurchases([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Verificar si hay compras
  const hasPurchases = purchases.length > 0;

  return {
    purchases,
    isLoading,
    hasPurchases,
    savePurchase,
    getPurchaseById,
    clearPurchases,
  };
}

