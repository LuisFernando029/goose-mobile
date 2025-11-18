import { Image } from 'expo-image';
import { Platform, StyleSheet, useColorScheme } from 'react-native';

import { HelloWave } from '@/src/components/hello-wave';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { Link } from 'expo-router';
import { Colors } from '../../constants/theme'; // 👈 importa o tema

export default function HomeScreen() {
  const scheme = useColorScheme(); // 'light' ou 'dark'
  const theme = Colors[scheme ?? 'light']; // 👈 seleciona as cores certas

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: theme.primary, // usa cor principal do tema claro
        dark: theme.primary, // e a mesma no escuro (ou mude se quiser contraste)
      }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={[styles.titleContainer, { backgroundColor: theme.background }]}>
        <ThemedText type="title" style={{ color: theme.foreground }}>
          Welcome!
        </ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={[styles.stepContainer, { backgroundColor: theme.card }]}>
        <ThemedText type="subtitle" style={{ color: theme.primary }}>
          Step 1: Try it
        </ThemedText>
        <ThemedText style={{ color: theme.foreground }}>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold" style={{ color: theme.accent }}>
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.stepContainer, { backgroundColor: theme.card }]}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle" style={{ color: theme.primary }}>
              Step 2: Explore
            </ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText style={{ color: theme.foreground }}>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.stepContainer, { backgroundColor: theme.card }]}>
        <ThemedText type="subtitle" style={{ color: theme.primary }}>
          Step 3: Get a fresh start
        </ThemedText>
        <ThemedText style={{ color: theme.foreground }}>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold" style={{ color: theme.accent }}>
            npm run reset-project
          </ThemedText>{' '}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will
          move the current <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
