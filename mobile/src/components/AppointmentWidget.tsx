import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { twMerge } from 'tailwind-merge';

export interface AppointmentWidgetProps {
    days: Array<{ date: string; available: boolean; selected?: boolean }>;
    hours: Array<{ time: string; available: boolean; selected?: boolean }>;
    onSelectDay: (date: string) => void;
    onSelectHour: (time: string) => void;
    className?: string;
}

export const AppointmentWidget: React.FC<AppointmentWidgetProps> = ({
    days,
    hours,
    onSelectDay,
    onSelectHour,
    className = '',
}) => (
    <View className={twMerge('bg-background-light dark:bg-background-dark rounded-2xl p-4 shadow-glass', className)}>
        <Text className="text-base font-semibold mb-2 text-background-dark dark:text-background-light">Selecione o dia</Text>
        <View className="flex-row mb-4" style={{ gap: 8 }}>
            {days.map((d) => (
                <Pressable
                    key={d.date}
                    onPress={() => d.available && onSelectDay(d.date)}
                    className={twMerge(
                        'px-3 py-2 rounded-xl',
                        d.selected ? 'bg-brand-secondary text-white' : 'bg-gray-200 dark:bg-gray-700',
                        !d.available && 'opacity-40'
                    )}
                >
                    <Text className={twMerge('text-sm', d.selected ? 'text-white' : 'text-background-dark dark:text-background-light')}>{d.date}</Text>
                </Pressable>
            ))}
        </View>
        <Text className="text-base font-semibold mb-2 text-background-dark dark:text-background-light">Selecione o horário</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {hours.map((h) => (
                <Pressable
                    key={h.time}
                    onPress={() => h.available && onSelectHour(h.time)}
                    className={twMerge(
                        'px-3 py-2 rounded-xl mb-2',
                        h.selected ? 'bg-brand-primary text-background-dark' : 'bg-gray-200 dark:bg-gray-700',
                        !h.available && 'opacity-40'
                    )}
                >
                    <Text className={twMerge('text-sm', h.selected ? 'text-background-dark' : 'text-background-dark dark:text-background-light')}>{h.time}</Text>
                </Pressable>
            ))}
        </View>
    </View>
);
