import { useState, useEffect, useCallback } from 'react';
import type { PurchaseSuccessData } from '../components/site/PurchaseSuccessView';

const LOCAL_STORAGE_KEY = 'raffle_purchases';
const STORAGE_EVENT = 'purchases_updated';

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseSuccessData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar compras desde localStorage
  const loadPurchases = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPurchases(Array.isArray(parsed) ? parsed : []);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Failed to parse purchases from localStorage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setPurchases([]);
    }
  }, []);

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
    setPurchases(prev => {
      const updated = [purchase, ...prev]; // Nueva compra al inicio
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new Event(STORAGE_EVENT));
      
      return updated;
    });
  }, []);

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

