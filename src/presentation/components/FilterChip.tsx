import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.surfaceSecondary,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText
        variant="caption"
        style={{
          color: selected ? theme.colors.white : theme.colors.text,
          fontWeight: '600',
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
});
