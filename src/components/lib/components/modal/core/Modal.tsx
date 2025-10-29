import React from 'react';
import Backdrop from './Backdrop';
import { motion, AnimatePresence } from 'framer-motion';

interface CloseXSimbolProps {
  onClose?: (e: React.MouseEvent) => void;
}

function CloseXSimbol({ onClose }: CloseXSimbolProps) {
  return (
    <button
      className="w-7 h-7 bg-bg-secondary hover:bg-bg-tertiary rounded-full p-1.5 
        absolute top-1.5 right-3 shadow-lg shadow-black/20 z-10 
        transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95"
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose(e);
      }}
    >
      <div className="flex w-full h-full justify-center items-center">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          <path
            className="fill-selected hover:fill-text-primary transition-colors duration-200"
            d="M5.7 20.1C5.20294 20.5971 4.39706 20.5971 3.9 20.1C3.40294 19.6029 3.40294 18.7971 3.9 18.3L10.2 12L3.9 5.7C3.40294 5.20294 3.40294 4.39706 3.9 3.9C4.39706 3.40294 5.20294 3.40294 5.7 3.9L12 10.2L18.3 3.9C18.7971 3.40294 19.6029 3.40294 20.1 3.9C20.5971 4.39706 20.5971 5.20294 20.1 5.7L13.8 12L20.1 18.3C20.5971 18.7971 20.5971 19.6029 20.1 20.1C19.6029 20.5971 18.7971 20.5971 18.3 20.1L12 13.8L5.7 20.1Z"
          />
        </svg>
      </div>
    </button>
  );
}

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  showX?: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  showBackdrop?: boolean;
  lockBodyScroll?: boolean;
  closeOnBackdropClick?: boolean;
}

const modalSizes = {
  sm: "w-[320px] md:w-full md:max-w-[400px]",
  md: "w-[375px] md:w-full md:max-w-[450px]",
  lg: "w-[500px] md:w-full md:max-w-[600px]",
  xl: "w-[600px] md:w-full md:max-w-[800px]"
};

const modalAnimation = {
  initial: {
    scale: 0.8,
    opacity: 0,
    y: 20
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const
    }
  }
};

function Modal({
  children,
  open,
  showX = true,
  onClose,
  size = 'md',
  title,
  showBackdrop: _showBackdrop = true,
  lockBodyScroll = true,
  closeOnBackdropClick = true
}: ModalProps) {
  const handleBackdropClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence
      initial={false}
      onExitComplete={() => null}
    >
      {open && (
        <Backdrop
          onBackdropClick={closeOnBackdropClick ? handleBackdropClick : undefined}
          background="bg-black/50"
          zIndex={50}
          lockBodyScroll={lockBodyScroll}
        >
          <motion.div
            variants={modalAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative ${modalSizes[size]} 
              min-h-[200px]
              rounded-2xl bg-bg-secondary border border-border-light
              shadow-2xl shadow-black/30 backdrop-blur-sm
              flex flex-col`}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-4 mt-4">
                <h2 className="text-lg font-semibold text-text-primary bg-bg-tertiary w-full  rounded-md p-2">
                  {title}
                </h2>
                {showX && <CloseXSimbol onClose={onClose} />}
              </div>
            )}

            <div className={`flex-1 ${title ? 'p-6 pt-4' : 'p-6'}`}>
              {children}
            </div>

            {showX && !title && <CloseXSimbol onClose={onClose} />}
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

export default Modal;
