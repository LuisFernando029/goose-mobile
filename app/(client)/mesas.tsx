import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Clock, CheckCircle, ArrowLeft, RefreshCw, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Mesa {
  id: string;
  label: string;
  seats: number;
  status: "available" | "busy" | "reserved";
  tipo: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  lock: boolean;
  reservedBy?: string;
}

const BASE_URL = "http://192.168.15.48:4000";

export default function ClientMesasScreen() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [mesaAtual, setMesaAtual] = useState<Mesa | null>(null);

  useEffect(() => {
    loadClientData();
    loadMesas();
  }, []);

  const loadClientData = async () => {
    try {
      const data = await AsyncStorage.getItem('clientData');
      if (data) {
        const client = JSON.parse(data);
        setClientData(client);
        
        // Se tem mesa salva, busca ela
        if (client.mesaId) {
          await loadMesaAtual(client.mesaId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  };

  const loadMesaAtual = async (mesaId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/tables/${mesaId}`);
      if (response.ok) {
        const mesa = await response.json();
        setMesaAtual(mesa);
      }
    } catch (error) {
      console.error('Erro ao carregar mesa atual:', error);
    }
  };

  const loadMesas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/tables`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar mesas: ${response.status}`);
      }

      const data = await response.json();
      
      // Filtra apenas elementos do tipo 'mesa'
      const mesasData = data.filter((item: Mesa) => item.tipo === 'mesa');
      
      setMesas(mesasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      Alert.alert("Erro", `Não foi possível carregar as mesas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const liberarMesaAnterior = async (mesaAnteriorId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/tables/${mesaAnteriorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'available',
          reservedBy: null
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao liberar mesa anterior');
      }

      // Atualiza localmente
      setMesas(prev =>
        prev.map(m =>
          m.id === mesaAnteriorId
            ? { ...m, status: 'available', reservedBy: undefined }
            : m
        )
      );
    } catch (error) {
      console.error('Erro ao liberar mesa anterior:', error);
    }
  };

  const ocuparMesa = async (mesa: Mesa) => {
    if (!clientData) {
      Alert.alert('Erro', 'Dados do cliente não encontrados');
      return;
    }

    // Se já tem uma mesa ocupada
    if (mesaAtual && mesaAtual.id !== mesa.id) {
      Alert.alert(
        'Trocar de Mesa',
        `Você está atualmente na ${mesaAtual.label}.\n\nDeseja trocar para a ${mesa.label}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Trocar',
            onPress: async () => {
              try {
                // 1. Libera a mesa anterior
                await liberarMesaAnterior(mesaAtual.id);

                // 2. Ocupa a nova mesa
                const response = await fetch(`${BASE_URL}/tables/${mesa.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    status: 'busy',
                    reservedBy: clientData.nome
                  }),
                });

                if (!response.ok) {
                  throw new Error('Erro ao ocupar nova mesa');
                }

                // 3. Atualiza localmente
                setMesas(prev =>
                  prev.map(m =>
                    m.id === mesa.id
                      ? { ...m, status: 'busy', reservedBy: clientData.nome }
                      : m
                  )
                );

                // 4. Salva a nova mesa no AsyncStorage
                const updatedClientData = {
                  ...clientData,
                  mesaId: mesa.id,
                  mesaLabel: mesa.label
                };
                
                await AsyncStorage.setItem('clientData', JSON.stringify(updatedClientData));
                setClientData(updatedClientData);
                setMesaAtual(mesa);

                // 5. Redireciona para o cardápio
                router.push('/(client)/cardapio');
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                Alert.alert('Erro', `Não foi possível trocar de mesa: ${errorMessage}`);
              }
            },
          },
        ]
      );
      return;
    }

    // Se for a mesma mesa já ocupada
    if (mesaAtual && mesaAtual.id === mesa.id) {
      Alert.alert(
        'Mesa Já Ocupada',
        `Você já está ocupando a ${mesa.label}.`,
        [
          {
            text: 'OK',
            style: 'cancel'
          },
          {
            text: 'Ver Cardápio',
            onPress: () => router.push('/(client)/cardapio')
          }
        ]
      );
      return;
    }

    // Primeira vez ocupando uma mesa
    Alert.alert(
      'Confirmar Ocupação',
      `Deseja ocupar a ${mesa.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/tables/${mesa.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  status: 'busy',
                  reservedBy: clientData.nome
                }),
              });

              if (!response.ok) {
                throw new Error('Erro ao ocupar mesa');
              }

              // Atualiza localmente
              setMesas(prev =>
                prev.map(m =>
                  m.id === mesa.id
                    ? { ...m, status: 'busy', reservedBy: clientData.nome }
                    : m
                )
              );

              // Salva a mesa ocupada no clientData
              const updatedClientData = {
                ...clientData,
                mesaId: mesa.id,
                mesaLabel: mesa.label
              };
              
              await AsyncStorage.setItem('clientData', JSON.stringify(updatedClientData));
              setClientData(updatedClientData);
              setMesaAtual(mesa);

              // Redireciona automaticamente para o cardápio
              router.push('/(client)/cardapio');
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
              Alert.alert('Erro', `Não foi possível ocupar a mesa: ${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  const handleSair = async () => {
    Alert.alert(
      'Sair do Sistema',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Se tem mesa ocupada, libera ela antes de sair
              if (mesaAtual) {
                await liberarMesaAnterior(mesaAtual.id);
              }

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
        }
      ]
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { color: '#22C55E', text: 'Disponível', icon: CheckCircle };
      case 'busy':
        return { color: '#DC2626', text: 'Ocupada', icon: Users };
      case 'reserved':
        return { color: '#EAB308', text: 'Reservada', icon: Clock };
      default:
        return { color: '#9CA3AF', text: status, icon: Users };
    }
  };

  const mesasDisponiveis = mesas.filter((m) => m.status === "available").length;
  const mesasOcupadas = mesas.filter((m) => m.status === "busy").length;
  const mesasReservadas = mesas.filter((m) => m.status === "reserved").length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Carregando mesas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Users color="#DC2626" size={48} />
        <Text style={styles.errorTitle}>Erro ao carregar mesas</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMesas}>
          <RefreshCw size={20} color="#FFF" />
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Escolha sua Mesa</Text>
              <Text style={styles.subtitle}>
                {clientData?.nome || 'Cliente'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadMesas}
              disabled={loading}
            >
              <RefreshCw size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Cliente */}
        {clientData && (
          <View style={styles.clientInfoCard}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{clientData.nome}</Text>
              <Text style={styles.clientCpf}>CPF: {clientData.cpf}</Text>
              {mesaAtual && (
                <Text style={styles.clientMesa}>
                  📍 Mesa Atual: {mesaAtual.label}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mesasDisponiveis}</Text>
            <Text style={styles.statLabel}>Disponíveis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{mesasOcupadas}</Text>
            <Text style={styles.statLabel}>Ocupadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EAB308' }]}>{mesasReservadas}</Text>
            <Text style={styles.statLabel}>Reservadas</Text>
          </View>
        </View>

        {/* Lista de Mesas */}
        <View style={styles.mesasContainer}>
          <Text style={styles.sectionTitle}>Mesas do Restaurante</Text>
          <Text style={styles.sectionSubtitle}>
            {mesaAtual ? 'Trocar de mesa' : 'Escolha uma mesa disponível'}
          </Text>
          
          {mesas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhuma mesa disponível</Text>
            </View>
          ) : (
            <View style={styles.mesasGrid}>
              {mesas.map((mesa) => {
                const statusInfo = getStatusInfo(mesa.status);
                const StatusIcon = statusInfo.icon;
                const isDisponivel = mesa.status === 'available';
                const isMesaAtual = mesaAtual?.id === mesa.id;
                
                return (
                  <View
                    key={mesa.id}
                    style={[
                      styles.mesaCard,
                      mesa.status === 'available' && styles.mesaDisponivel,
                      mesa.status === 'busy' && styles.mesaOcupada,
                      mesa.status === 'reserved' && styles.mesaReservada,
                      isMesaAtual && styles.mesaAtualCard,
                    ]}
                  >
                    <View style={styles.mesaHeader}>
                      <Text style={styles.mesaNumero}>
                        {mesa.label}
                        {isMesaAtual && ' ✓'}
                      </Text>
                      <StatusIcon size={16} color={statusInfo.color} />
                    </View>
                    
                    <Text style={styles.mesaCapacidade}>
                      <Users size={14} color="#9CA3AF" /> {mesa.seats} lugares
                    </Text>
                    
                    <Text style={[styles.mesaStatus, { color: statusInfo.color }]}>
                      {isMesaAtual ? 'Sua Mesa' : statusInfo.text}
                    </Text>

                    {mesa.reservedBy && !isMesaAtual && (
                      <Text style={styles.mesaCliente}>
                        {mesa.reservedBy}
                      </Text>
                    )}

                    {/* Botão sempre visível para mesa atual ou disponíveis */}
                    {(isDisponivel || isMesaAtual) && (
                      <TouchableOpacity
                        style={[
                          styles.ocuparButton,
                          isMesaAtual && styles.mesaAtualButton
                        ]}
                        onPress={() => ocuparMesa(mesa)}
                      >
                        <Text style={styles.ocuparButtonText}>
                          {isMesaAtual ? 'Ver Cardápio' : 'Ocupar Mesa'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão de Sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  refreshButton: {
    padding: 8,
    backgroundColor: '#27272A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  clientInfoCard: {
    backgroundColor: '#27272A',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
  clientMesa: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#27272A',
    borderRadius: 10,
    padding: 14,
    width: width * 0.28,
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  mesaDisponivel: {
    borderColor: '#22C55E',
  },
  mesaOcupada: {
    borderColor: '#DC2626',
    opacity: 0.7,
  },
  mesaReservada: {
    borderColor: '#EAB308',
    opacity: 0.7,
  },
  mesaAtualCard: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    opacity: 1,
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
    marginBottom: 8,
  },
  mesaCliente: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  ocuparButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  mesaAtualButton: {
    backgroundColor: '#22C55E',
  },
  ocuparButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
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