import { useTheme } from '../context/ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    // Backgrounds
    bgMain: isDark ? '#10142D' : '#F4F4F6',
    bgCard: isDark ? '#1C213E' : '#FFFFFF',
    bgInput: isDark ? '#2A2F4F' : '#F3F4F6',
    bgButton: isDark ? '#2A2F4F' : '#E5E7EB',

    // Text
    textMain: isDark ? '#FFFFFF' : '#10142D',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    textMuted: isDark ? '#6B7280' : '#9CA3AF',

    // Accents
    accentYellow: '#FFD600',
    accentRed: '#FF6B6B',
    accentGreen: '#22C55E',

    // Borders
    borderColor: isDark ? '#2A2F4F' : '#E5E7EB',
    borderColorLight: isDark ? '#1C213E' : '#F3F4F6',

    // Special
    isDark,
  };
};
