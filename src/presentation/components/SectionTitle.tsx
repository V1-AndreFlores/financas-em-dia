import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

interface SectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle">{title}</AppText>
      {description ? (
        <AppText variant="caption" color="muted" style={styles.description}>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginTop: 8,
  },
  description: {
    marginTop: 2,
  },
});
