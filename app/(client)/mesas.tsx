import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Clock, CheckCircle, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Mesa {
  id: number;
  numero: number;
  capacidade: number;
  status: "disponivel" | "ocupada" | "reservada";
  cliente?: string;
  cpf?: string;
  horarioReserva?: string;
}

const MESAS_STORAGE_KEY = '@Capone:mesas';

export default function ClientMesasScreen() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [mesaReservada, setMesaReservada] = useState<number | null>(null);

  // Carregar dados do cliente e mesas
  useEffect(() => {
    loadClientData();
    loadMesas();
  }, []);

  // Carregar dados do cliente
  const loadClientData = async () => {
    try {
      const data = await AsyncStorage.getItem('clientData');
      if (data) {
        const client = JSON.parse(data);
        setClientData(client);
        setMesaReservada(client.mesa);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  };

  // Carregar mesas do AsyncStorage
  const loadMesas = async () => {
    try {
      const storedMesas = await AsyncStorage.getItem(MESAS_STORAGE_KEY);
      if (storedMesas) {
        setMesas(JSON.parse(storedMesas));
      } else {
        // Se não há mesas, usa as iniciais e salva
        const mesasIniciais: Mesa[] = [
          { id: 1, numero: 1, capacidade: 4, status: "disponivel" },
          { id: 2, numero: 2, capacidade: 2, status: "disponivel" },
          { id: 3, numero: 3, capacidade: 2, status: "ocupada" },
          { id: 4, numero: 4, capacidade: 6, status: "disponivel" },
          { id: 5, numero: 5, capacidade: 6, status: "ocupada" },
          { id: 6, numero: 6, capacidade: 4, status: "disponivel" },
          { id: 7, numero: 7, capacidade: 2, status: "disponivel" },
          { id: 8, numero: 8, capacidade: 8, status: "disponivel" },
        ];
        await AsyncStorage.setItem(MESAS_STORAGE_KEY, JSON.stringify(mesasIniciais));
        setMesas(mesasIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    }
  };

  // Função para reservar mesa
  const reservarMesa = async (mesaNumero: number) => {
    if (!clientData) return;

    Alert.alert(
      'Confirmar Reserva',
      `Deseja reservar a Mesa ${mesaNumero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reservar', 
          onPress: async () => {
            try {
              // Atualizar a mesa no AsyncStorage
              const storedMesas = await AsyncStorage.getItem(MESAS_STORAGE_KEY);
              if (storedMesas) {
                const mesasData: Mesa[] = JSON.parse(storedMesas);
                const mesaIndex = mesasData.findIndex((m: Mesa) => m.numero === mesaNumero);
                
                if (mesaIndex !== -1) {
                  mesasData[mesaIndex] = {
                    ...mesasData[mesaIndex],
                    status: 'reservada',
                    cliente: clientData.nome,
                    cpf: clientData.cpf,
                    horarioReserva: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  };
                  
                  await AsyncStorage.setItem(MESAS_STORAGE_KEY, JSON.stringify(mesasData));
                  setMesas(mesasData);
                }
              }

              // Atualizar clientData com a mesa reservada
              const updatedClientData = {
                ...clientData,
                mesa: mesaNumero
              };
              
              await AsyncStorage.setItem('clientData', JSON.stringify(updatedClientData));
              setClientData(updatedClientData);
              setMesaReservada(mesaNumero);

              Alert.alert(
                'Reserva Confirmada!', 
                `Mesa ${mesaNumero} reservada para ${clientData.nome}`,
                [
                  { 
                    text: 'Ver Cardápio', 
                    onPress: () => router.push('/(client)/cardapio')
                  },
                  { text: 'Continuar Navegando', style: 'cancel' }
                ]
              );
            } catch (error) {
              console.error('Erro ao reservar mesa:', error);
              Alert.alert('Erro', 'Não foi possível reservar a mesa. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  // Função para sair do sistema (cliente)
  const handleSair = async () => {
    Alert.alert(
      'Sair do Sistema',
      'Deseja sair e limpar seus dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['clientData']);
              if (typeof window !== 'undefined') {
                localStorage.clear();
              }
              router.replace('/');
            } catch (error) {
              console.error('Erro ao sair:', error);
              Alert.alert('Erro', 'Não foi possível sair do sistema.');
            }
          }
        }
      ]
    );
  };

  // Função para obter informações do status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'disponivel':
        return { color: '#22C55E', text: 'Disponível', icon: CheckCircle };
      case 'ocupada':
        return { color: '#DC2626', text: 'Ocupada', icon: Users };
      case 'reservada':
        return { color: '#EAB308', text: 'Reservada', icon: Clock };
      default:
        return { color: '#9CA3AF', text: status, icon: Users };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#9CA3AF" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Escolha sua Mesa</Text>
          <Text style={styles.subtitle}>
            {clientData?.nome} - Cliente
          </Text>
        </View>

        {/* Info Cliente */}
        <View style={styles.clientInfoCard}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{clientData?.nome}</Text>
            <Text style={styles.clientCpf}>CPF: {clientData?.cpf}</Text>
          </View>
          {mesaReservada && (
            <View style={styles.reservaBadge}>
              <Text style={styles.reservaText}>Mesa {mesaReservada}</Text>
            </View>
          )}
        </View>

        {/* Lista de Mesas */}
        <View style={styles.mesasContainer}>
          <Text style={styles.sectionTitle}>Mesas Disponíveis</Text>
          <Text style={styles.sectionSubtitle}>
            Toque em uma mesa disponível para reservar
          </Text>
          
          <View style={styles.mesasGrid}>
            {mesas.map((mesa) => {
              const statusInfo = getStatusInfo(mesa.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <TouchableOpacity
                  key={mesa.id}
                  style={[
                    styles.mesaCard,
                    mesa.status === 'disponivel' && styles.mesaDisponivel,
                    mesa.status === 'ocupada' && styles.mesaOcupada,
                    mesa.status === 'reservada' && styles.mesaReservada,
                  ]}
                  onPress={() => mesa.status === 'disponivel' && reservarMesa(mesa.numero)}
                  disabled={mesa.status !== 'disponivel'}
                >
                  <View style={styles.mesaHeader}>
                    <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
                    <StatusIcon size={16} color={statusInfo.color} />
                  </View>
                  
                  <Text style={styles.mesaCapacidade}>
                    <Users size={14} color="#9CA3AF" /> {mesa.capacidade} lugares
                  </Text>
                  
                  <Text style={[styles.mesaStatus, { color: statusInfo.color }]}>
                    {statusInfo.text}
                  </Text>

                  {mesa.cliente && (
                    <Text style={styles.mesaCliente}>
                      Reservada para: {mesa.cliente}
                    </Text>
                  )}

                  {mesa.status === 'disponivel' && (
                    <TouchableOpacity
                      style={styles.reservarButton}
                      onPress={() => reservarMesa(mesa.numero)}
                    >
                      <Text style={styles.reservarButtonText}>Reservar Mesa</Text>
                    </TouchableOpacity>
                  )}

                  {mesa.status === 'reservada' && mesa.numero === mesaReservada && (
                    <TouchableOpacity
                      style={styles.verCardapioButton}
                      onPress={() => router.push('/(client)/cardapio')}
                    >
                      <Text style={styles.verCardapioButtonText}>Ver Cardápio</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botão de Sair */}
        <TouchableOpacity 
          style={styles.sairButton}
          onPress={handleSair}
        >
          <Text style={styles.sairButtonText}>🚪 Sair do Sistema</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: '#9CA3AF',
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  clientInfoCard: {
    backgroundColor: '#27272A',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientCpf: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  reservaBadge: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reservaText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  mesasContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  mesasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mesaCard: {
    width: width * 0.44,
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  mesaDisponivel: {
    borderColor: '#22C55E',
  },
  mesaOcupada: {
    borderColor: '#DC2626',
    opacity: 0.6,
  },
  mesaReservada: {
    borderColor: '#EAB308',
  },
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mesaNumero: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mesaCapacidade: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  mesaStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  mesaCliente: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reservarButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  reservarButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verCardapioButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  verCardapioButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sairButton: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 16,
  },
  sairButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});