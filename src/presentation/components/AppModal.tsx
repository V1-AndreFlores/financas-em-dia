import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

export type AppModalPresentation = 'center' | 'bottom';

interface AppModalProps extends PropsWithChildren {
  visible: boolean;
  onRequestClose: () => void;
  presentation?: AppModalPresentation;
  dismissOnBackdropPress?: boolean;
  contentStyle?: ViewStyle;
  maxWidth?: number;
}

const OPEN_DURATION = 220;
const CLOSE_DURATION = 170;

export function AppModal({
  children,
  visible,
  onRequestClose,
  presentation = 'center',
  dismissOnBackdropPress = true,
  contentStyle,
  maxWidth = 440,
}: AppModalProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      setIsRendered(true);
      progress.setValue(0);

      requestAnimationFrame(() => {
        Animated.timing(progress, {
          toValue: 1,
          duration: OPEN_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });

      return;
    }

    if (!isRendered) {
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsRendered(false);
      }
    });
  }, [isRendered, progress, visible]);

  if (!isRendered) {
    return null;
  }

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: presentation === 'bottom' ? [48, 0] : [14, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: presentation === 'bottom' ? [1, 1] : [0.96, 1],
  });
  const availableWidth = Math.max(280, Math.min(width - 24, maxWidth));

  return (
    <Modal
      animationType="none"
      hardwareAccelerated
      onRequestClose={onRequestClose}
      statusBarTranslucent
      transparent
      visible={isRendered}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.72],
            }),
          },
        ]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dismissOnBackdropPress ? 'Fechar modal' : undefined}
        disabled={!dismissOnBackdropPress}
        onPress={dismissOnBackdropPress ? onRequestClose : undefined}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : Platform.OS === 'android'
              ? 'height'
              : undefined
        }
        pointerEvents="box-none"
        style={styles.keyboardAvoider}
      >
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.modalHost,
            presentation === 'bottom' ? styles.bottomHost : styles.centerHost,
            {
              opacity: progress,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <Pressable
            onPress={() => undefined}
            style={[
              styles.content,
              presentation === 'bottom'
                ? styles.bottomContent
                : styles.centerContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
                width: availableWidth,
              },
              contentStyle,
            ]}
          >
            {children}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000000',
  },
  keyboardAvoider: {
    flex: 1,
  },
  modalHost: {
    flex: 1,
    paddingHorizontal: 12,
  },
  centerHost: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHost: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  content: {
    borderWidth: 1,
    elevation: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  centerContent: {
    borderRadius: 24,
  },
  bottomContent: {
    borderRadius: 24,
  },
});
