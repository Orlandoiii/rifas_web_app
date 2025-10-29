import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface BackdropProps {
    children: React.ReactNode;
    outRef?: React.Ref<HTMLDivElement>;
    background?: string;
    onBackdropClick?: () => void;
    zIndex?: number;
    lockBodyScroll?: boolean;
}

const backDropAnimation = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: "easeInOut" as const
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
            ease: "easeInOut" as const
        }
    }
};

export default function Backdrop({
    children,
    outRef,
    background = "bg-bg-primary/30",
    onBackdropClick,
    zIndex = 40,
    lockBodyScroll = true
}: BackdropProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (lockBodyScroll) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            if (lockBodyScroll) {
                document.body.style.overflow = 'unset';
            }
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onBackdropClick) {
            onBackdropClick();
        }
    };

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <motion.div
            variants={backDropAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ ease: "easeInOut" as const }}
            ref={outRef}
            className={`fixed inset-0 ${background} h-full w-full overflow-y-auto flex justify-center items-start py-6`}
            style={{ zIndex }}
            onClick={handleBackdropClick}
        >
            {children}
        </motion.div>,
        document.body
    );
}