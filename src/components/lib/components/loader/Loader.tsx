import { motion } from 'framer-motion'

interface LoaderProps {
    message?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Loader({ 
    message = "Cargando datos...", 
    size = 'md',
    className = ""
}: LoaderProps) {
    const sizeClasses = {
        sm: {
            container: "py-4 space-y-4",
            spinner: "w-8 h-8",
            dot: "w-1 h-1",
            progress: "w-16 h-0.5",
            text: "text-sm"
        },
        md: {
            container: "py-6 space-y-6",
            spinner: "w-12 h-12",
            dot: "w-1.5 h-1.5",
            progress: "w-24 h-1",
            text: "text-base"
        },
        lg: {
            container: "py-8 space-y-6",
            spinner: "w-16 h-16",
            dot: "w-2 h-2",
            progress: "w-32 h-1",
            text: "text-lg"
        }
    }

    const currentSize = sizeClasses[size]

    const spinnerAnimation = {
        rotate: {
            rotate: 360,
            transition: {
                duration: 1,
                ease: "linear" as const,
                repeat: Infinity
            }
        }
    };

    const pulseAnimation = {
        pulse: {
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 2,
                ease: "easeInOut" as const,
                repeat: Infinity
            }
        }
    };

    const dotsAnimation = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const dotAnimation = {
        initial: { y: 0 },
        animate: {
            y: [-5, 5, -5],
            transition: {
                duration: 0.6,
                ease: "easeInOut" as const,
                repeat: Infinity
            }
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center ${currentSize.container} ${className}`}>
            <div className="relative">
                <motion.div
                    variants={spinnerAnimation}
                    animate="rotate"
                    className={`${currentSize.spinner} border-4 border-border-light rounded-full`}
                />

                <motion.div
                    variants={spinnerAnimation}
                    animate="rotate"
                    className={`absolute inset-0 ${currentSize.spinner} border-4 border-transparent border-t-selected rounded-full`}
                />

                <motion.div
                    variants={pulseAnimation}
                    animate="pulse"
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className={`${currentSize.dot} bg-selected rounded-full`}></div>
                </motion.div>
            </div>

            <div className="text-center space-y-2">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-text-primary font-medium ${currentSize.text}`}
                >
                    {message}
                </motion.p>

                <motion.div
                    variants={dotsAnimation}
                    animate="animate"
                    className="flex justify-center space-x-1"
                >
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            variants={dotAnimation}
                            className={`${currentSize.dot} bg-selected rounded-full`}
                        />
                    ))}
                </motion.div>
            </div>

            <div className={`${currentSize.progress} bg-bg-tertiary rounded-full overflow-hidden`}>
                <motion.div
                    className="h-full bg-selected rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut" as const,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
            </div>
        </div>
    );
}
