import { Image, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface AppSplashScreenProps {
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function AppSplashScreen({ onLayout }: AppSplashScreenProps) {
  return (
    <View onLayout={onLayout} style={styles.container}>
      <StatusBar style="light" />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={require('../../../assets/images/splash.png')}
        style={styles.image}
      />
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
});
