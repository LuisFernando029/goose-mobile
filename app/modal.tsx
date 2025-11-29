// app/(admin)/modal.tsx - SUBSTITUA TODO O CONTEÚDO POR ESTE
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal Screen</Text>
      <Text style={styles.description}>
        Esta é uma tela modal de exemplo.
      </Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Fechar Modal</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#18181B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    padding: 15,
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 16,
    textDecorationLine: 'underline' as 'underline',
  },
});