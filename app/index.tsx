import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function IdentificationScreen() {
  const router = useRouter();

  const handleClearAllData = async () => {
    Alert.alert(
      '🧹 Limpar Todos os Dados',
      'Isso irá remover TODOS os logins, reservas e dados do sistema. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpa AsyncStorage
              await AsyncStorage.multiRemove([
                'userType',
                'userToken', 
                'userData',
                'clientData',
                '@Capone:mesas'
              ]);
              
              // Limpa localStorage diretamente (para garantir)
              if (typeof window !== 'undefined') {
                localStorage.clear();
              }
              
              Alert.alert('✅ Sucesso', 'Todos os dados foram limpos!');
              // Recarrega a página
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            } catch (error) {
              Alert.alert('❌ Erro', 'Não foi possível limpar os dados');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍷 CAPONE</Text>
        <Text style={styles.subtitle}>Bem-vindo ao nosso restaurante</Text>
      </View>

      {/* Cards de Opções */}
      <View style={styles.optionsContainer}>
        {/* Opção Cliente - Reservar Mesa */}
        <TouchableOpacity 
          style={[styles.optionCard, styles.clientCard]}
          onPress={() => router.push('/(client)/identificacao')}
        >
          <View style={[styles.optionIcon, styles.clientOptionIcon]}>
            <Text style={styles.optionEmoji}>👤</Text>
          </View>
          <Text style={styles.optionTitle}>Reservar uma Mesa</Text>
          <Text style={styles.optionDescription}>
            Cliente - reserve sua mesa e faça pedidos
          </Text>
          <Text style={[styles.optionAction, styles.clientAction]}>Toque para começar →</Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Opção Admin - Acesso Restrito */}
        <TouchableOpacity 
          style={[styles.optionCard, styles.adminCard]}
          onPress={() => router.push('/auth/login-admin')}
        >
          <View style={[styles.optionIcon, styles.adminOptionIcon]}>
            <Text style={styles.optionEmoji}>👨‍💼</Text>
          </View>
          <Text style={styles.optionTitle}>Acesso Administrativo</Text>
          <Text style={styles.optionDescription}>
            Funcionários - gestão do estabelecimento
          </Text>
          <Text style={[styles.optionAction, styles.adminAction]}>Login restrito →</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de Limpeza */}
      <TouchableOpacity 
        style={styles.clearButton}
        onPress={handleClearAllData}
      >
        <Text style={styles.clearButtonText}>🧹 Limpar Todos os Dados do Sistema</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Capone Restaurant
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  clientCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientOptionIcon: {
    backgroundColor: '#2563EB',
  },
  adminOptionIcon: {
    backgroundColor: '#DC2626',
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  optionAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  clientAction: {
    color: '#60A5FA',
  },
  adminAction: {
    color: '#FCA5A5',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  separatorText: {
    color: '#6B7280',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
  },
});