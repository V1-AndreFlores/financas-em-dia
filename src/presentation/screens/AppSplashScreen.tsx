import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface AppSplashScreenProps {
  onLayout?: (event: LayoutChangeEvent) => void;
}

const DOT_INITIAL_OPACITY = 0.3;
const DOT_ACTIVE_OPACITY = 1;
const DOT_ANIMATION_DURATION_MS = 280;
const DOT_STAGGER_MS = 180;
const DOT_LOOP_PAUSE_MS = 220;

export function AppSplashScreen({ onLayout }: AppSplashScreenProps) {
  const dotAnimations = useRef([
    new Animated.Value(DOT_INITIAL_OPACITY),
    new Animated.Value(DOT_INITIAL_OPACITY),
    new Animated.Value(DOT_INITIAL_OPACITY),
  ]).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.stagger(
          DOT_STAGGER_MS,
          dotAnimations.map((dotAnimation) =>
            Animated.sequence([
              Animated.timing(dotAnimation, {
                duration: DOT_ANIMATION_DURATION_MS,
                toValue: DOT_ACTIVE_OPACITY,
                useNativeDriver: true,
              }),
              Animated.timing(dotAnimation, {
                duration: DOT_ANIMATION_DURATION_MS,
                toValue: DOT_INITIAL_OPACITY,
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
        Animated.delay(DOT_LOOP_PAUSE_MS),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dotAnimations]);

  return (
    <View onLayout={onLayout} style={styles.container}>
      <StatusBar style="light" />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={require('../../../assets/images/splash.png')}
        style={styles.image}
      />

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={styles.loadingDotsContainer}
      >
        {dotAnimations.map((dotAnimation, index) => (
          <Animated.View
            key={`splash-loading-dot-${index}`}
            style={[
              styles.loadingDot,
              {
                opacity: dotAnimation,
                transform: [
                  {
                    scale: dotAnimation.interpolate({
                      inputRange: [DOT_INITIAL_OPACITY, DOT_ACTIVE_OPACITY],
                      outputRange: [0.82, 1.18],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#031B5C',
    flex: 1,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loadingDotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '76.5%',
  },
  loadingDot: {
    backgroundColor: '#42E4A1',
    borderRadius: 7,
    elevation: 4,
    height: 13,
    shadowColor: '#42E4A1',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowOpacity: 0.85,
    shadowRadius: 5,
    width: 13,
  },
});
