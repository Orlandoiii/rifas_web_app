import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoadModalState {
  isLoading: boolean;
  message: string;
}

interface LoadModalActions {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  setMessage: (message: string) => void;
  withLoader: <T>(promise: Promise<T>, message?: string) => Promise<T>;
  withLoaderAsync: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

type LoadModalStore = LoadModalState & LoadModalActions;

export const useLoadModalStore = create<LoadModalStore>()(
  devtools(
    (set, get) => ({
      isLoading: false,
      message: "Cargando...",

      showLoader: (message?: string) => {
        set(
          {
            isLoading: true,
            message: message || "Cargando..."
          },
          false,
          'loadModal/showLoader'
        );
      },

      hideLoader: () => {
        set(
          { isLoading: false },
          false,
          'loadModal/hideLoader'
        );
      },

      setMessage: (message: string) => {
        set(
          { message },
          false,
          'loadModal/setMessage'
        );
      },

      withLoader: async <T>(promise: Promise<T>, message?: string): Promise<T> => {
        try {
          get().showLoader(message);
          const result = await promise;
          return result;
        } finally {
          get().hideLoader();
        }
      },

      withLoaderAsync: async <T>(asyncFn: () => Promise<T>, message?: string): Promise<T> => {
        try {
          get().showLoader(message);
          const result = await asyncFn();
          return result;
        } finally {
          get().hideLoader();
        }
      }
    }),
    {
      name: 'load-modal-store',
      enabled: import.meta.env.DEV
    }
  )
);

export const useIsLoading = () => useLoadModalStore((state) => state.isLoading);
export const useMessage = () => useLoadModalStore((state) => state.message);

export const useShowLoader = () => useLoadModalStore((state) => state.showLoader);
export const useHideLoader = () => useLoadModalStore((state) => state.hideLoader);
export const useSetMessage = () => useLoadModalStore((state) => state.setMessage);
export const useWithLoader = () => useLoadModalStore((state) => state.withLoader);
export const useWithLoaderAsync = () => useLoadModalStore((state) => state.withLoaderAsync);

export const useLoadModal = () => useLoadModalStore();