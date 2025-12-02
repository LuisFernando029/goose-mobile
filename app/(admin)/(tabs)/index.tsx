import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { ChefHat, Package, Users, BarChart3, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function AdminHomeScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Gestão de Mesas',
      description: 'Controle de ocupação e reservas',
      icon: Users,
      route: '/mesas',
      color: '#DC2626'
    },
    {
      title: 'Cardápio & Produtos',
      description: 'Gerencie o catálogo e estoque',
      icon: Package,
      route: '/cardapio',
      color: '#2563EB'
    },
    {
      title: 'Pedidos',
      description: 'Acompanhe pedidos em tempo real',
      icon: ChefHat,
      route: '/pedidos',
      color: '#059669'
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Sair do Sistema',
      'Deseja realmente sair da área administrativa?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Obtém todas as chaves do AsyncStorage
              const allKeys = await AsyncStorage.getAllKeys();
              
              // Remove todas as chaves
              if (allKeys.length > 0) {
                await AsyncStorage.multiRemove(allKeys);
              }
              
              // Navegação para a tela inicial
              router.replace('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair do sistema.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Substituí o texto pela Imagem */}
            <Image 
              source={require('assets/images/fedora.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.welcome}>Bem-vindo, Admin!</Text>
            <Text style={styles.subtitle}>Gestão do estabelecimento</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => router.push(`/(admin)/(tabs)${item.route}` as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <item.icon size={24} color="#FFF" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8/12</Text>
            <Text style={styles.statLabel}>Mesas Ocupadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Pedidos Hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>R$ 2.847</Text>
            <Text style={styles.statLabel}>Faturamento</Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  
  menuGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centraliza os itens no meio da tela
    gap: 16, // Espaçamento entre os cartões
  },
  logoImage: {
    width: 120,
    height: 120,
    tintColor: 'white',
  },
  menuCard: {
    width: width * 0.43, // Ajustei levemente a largura para caber bem com o gap
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    // marginBottom removido pois estamos usando gap
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});