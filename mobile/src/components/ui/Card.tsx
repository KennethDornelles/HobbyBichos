import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outline';
    className?: string;
}

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
    const baseStyles = 'rounded-hobby p-6';

    const variants = {
        default: 'bg-[#1C213E] dark:bg-white',
        elevated: 'bg-[#1C213E] dark:bg-white dark:shadow-card-light dark:border dark:border-hobby-border-light',
        outline: 'bg-[#1C213E] dark:bg-white dark:border-2 dark:border-hobby-border-light',
    };

    return (
        <View
            className={`${baseStyles} ${variants[variant]} ${className || ''}`}
            {...props}
        >
            {children}
        </View>
    );
}

// Componente para inputs dentro de cards
export function CardInput({ children, className, ...props }: ViewProps) {
    return (
        <View
            className={`
        bg-[#2A2F4F] dark:bg-gray-50 
        rounded-xl px-4 py-3
        dark:border dark:border-gray-200
        ${className || ''}
      `}
            {...props}
        >
            {children}
        </View>
    );
}
