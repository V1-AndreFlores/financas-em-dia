import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from './KeyboardAwareScrollView';
import { useAppTheme } from '../theme/AppThemeProvider';

interface AppScreenProps extends PropsWithChildren {
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
  scrollViewProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
}

export function AppScreen({
  children,
  scrollable = true,
  contentContainerStyle,
  scrollViewProps,
}: AppScreenProps) {
  const { theme } = useAppTheme();

  const contentStyle = [
    styles.content,
    {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    contentContainerStyle,
  ];

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : Platform.OS === 'android'
              ? 'height'
              : undefined
        }
        style={styles.keyboardAvoider}
      >
        {scrollable ? (
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            {...scrollViewProps}
            contentContainerStyle={contentStyle}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={contentStyle}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
  },
});
