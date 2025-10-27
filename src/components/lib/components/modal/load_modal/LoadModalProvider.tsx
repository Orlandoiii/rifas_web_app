import React from 'react';
import LoadModal from './LoadModal';

interface LoadModalProviderProps {
  children: React.ReactNode;
}

export function LoadModalProvider({ children }: LoadModalProviderProps) {
  return (
    <>
      {children}
      <LoadModal />
    </>
  );
}

export default LoadModalProvider;