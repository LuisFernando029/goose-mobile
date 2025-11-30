import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Clock, CheckCircle, ArrowLeft, RefreshCw, X, UserCheck } from 'lucide-react-native';

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
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    loadMesas();
  }, []);

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

  const openReservaModal = (mesa: Mesa) => {
    setSelectedMesa(mesa);
    setCustomerName('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMesa(null);
    setCustomerName('');
  };

  const confirmarReserva = async () => {
    if (!selectedMesa || !customerName.trim()) {
      Alert.alert('Erro', 'Nome do cliente é obrigatório');
      return;
    }

    try {
      setLoadingModal(true);

      const response = await fetch(`${BASE_URL}/tables/${selectedMesa.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'reserved',
          reservedBy: customerName.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao reservar mesa');
      }

      const updatedMesa = await response.json();

      // Atualiza localmente
      setMesas(prev =>
        prev.map(mesa =>
          mesa.id === selectedMesa.id
            ? { ...mesa, status: 'reserved', reservedBy: customerName.trim() }
            : mesa
        )
      );

      Alert.alert('Sucesso', `Mesa reservada para ${customerName.trim()}`);
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível reservar a mesa: ${errorMessage}`);
    } finally {
      setLoadingModal(false);
    }
  };

  const cancelarReserva = async (mesa: Mesa) => {
    Alert.alert(
      'Cancelar Reserva',
      `Deseja cancelar a reserva da ${mesa.label}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/tables/${mesa.id}`, {
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
                throw new Error('Erro ao cancelar reserva');
              }

              // Atualiza localmente
              setMesas(prev =>
                prev.map(m =>
                  m.id === mesa.id
                    ? { ...m, status: 'available', reservedBy: undefined }
                    : m
                )
              );

              Alert.alert('Sucesso', 'Reserva cancelada com sucesso');
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
              Alert.alert('Erro', `Não foi possível cancelar a reserva: ${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  const ocuparMesa = async (mesa: Mesa) => {
    Alert.alert(
      'Confirmar Ocupação',
      `Marcar ${mesa.label} como ocupada?`,
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
                  status: 'busy'
                }),
              });

              if (!response.ok) {
                throw new Error('Erro ao ocupar mesa');
              }

              // Atualiza localmente
              setMesas(prev =>
                prev.map(m =>
                  m.id === mesa.id
                    ? { ...m, status: 'busy' }
                    : m
                )
              );

              Alert.alert('Sucesso', `${mesa.label} agora está ocupada`);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
              Alert.alert('Erro', `Não foi possível ocupar a mesa: ${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  const liberarMesa = async (mesa: Mesa) => {
    Alert.alert(
      'Liberar Mesa',
      `Deseja liberar a ${mesa.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/tables/${mesa.id}`, {
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
                throw new Error('Erro ao liberar mesa');
              }

              // Atualiza localmente
              setMesas(prev =>
                prev.map(m =>
                  m.id === mesa.id
                    ? { ...m, status: 'available', reservedBy: undefined }
                    : m
                )
              );

              Alert.alert('Sucesso', `${mesa.label} liberada com sucesso`);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
              Alert.alert('Erro', `Não foi possível liberar a mesa: ${errorMessage}`);
            }
          },
        },
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
              <Text style={styles.title}>Gestão de Mesas</Text>
              <Text style={styles.subtitle}>
                Administre reservas e ocupação
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
            Gerencie as mesas e suas reservas
          </Text>
          
          {mesas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhuma mesa cadastrada</Text>
            </View>
          ) : (
            <View style={styles.mesasGrid}>
              {mesas.map((mesa) => {
                const statusInfo = getStatusInfo(mesa.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <View
                    key={mesa.id}
                    style={[
                      styles.mesaCard,
                      mesa.status === 'available' && styles.mesaDisponivel,
                      mesa.status === 'busy' && styles.mesaOcupada,
                      mesa.status === 'reserved' && styles.mesaReservada,
                    ]}
                  >
                    <View style={styles.mesaHeader}>
                      <Text style={styles.mesaNumero}>{mesa.label}</Text>
                      <StatusIcon size={16} color={statusInfo.color} />
                    </View>
                    
                    <Text style={styles.mesaCapacidade}>
                      <Users size={14} color="#9CA3AF" /> {mesa.seats} lugares
                    </Text>
                    
                    <Text style={[styles.mesaStatus, { color: statusInfo.color }]}>
                      {statusInfo.text}
                    </Text>

                    {mesa.reservedBy && (
                      <View style={styles.reservedByContainer}>
                        <UserCheck size={14} color="#EAB308" />
                        <Text style={styles.reservedByText}>{mesa.reservedBy}</Text>
                      </View>
                    )}

                    {/* Botões baseados no status */}
                    {mesa.status === 'available' && (
                      <TouchableOpacity
                        style={styles.reservarButton}
                        onPress={() => openReservaModal(mesa)}
                      >
                        <Text style={styles.reservarButtonText}>Reservar Mesa</Text>
                      </TouchableOpacity>
                    )}

                    {mesa.status === 'reserved' && (
                      <View style={styles.actionsContainer}>
                        <TouchableOpacity
                          style={styles.ocuparButton}
                          onPress={() => ocuparMesa(mesa)}
                        >
                          <Text style={styles.ocuparButtonText}>Cliente Chegou</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelarButton}
                          onPress={() => cancelarReserva(mesa)}
                        >
                          <Text style={styles.cancelarButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {mesa.status === 'busy' && (
                      <TouchableOpacity
                        style={styles.liberarButton}
                        onPress={() => liberarMesa(mesa)}
                      >
                        <Text style={styles.liberarButtonText}>Liberar Mesa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Reserva */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reservar {selectedMesa?.label}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nome do Cliente *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Digite o nome do cliente"
                placeholderTextColor="#9CA3AF"
                value={customerName}
                onChangeText={setCustomerName}
                autoFocus
              />

              {selectedMesa && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Mesa: <Text style={styles.modalInfoBold}>{selectedMesa.label}</Text>
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Capacidade: <Text style={styles.modalInfoBold}>{selectedMesa.seats} pessoas</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmarReserva}
                disabled={loadingModal}
              >
                {loadingModal ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar Reserva</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  reservedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 6,
  },
  reservedByText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 8,
  },
  reservarButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  reservarButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ocuparButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  ocuparButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelarButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  liberarButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  liberarButtonText: {
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#18181B',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalInfo: {
    marginTop: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  modalInfoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  modalInfoBold: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  modalCancelText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: '#2563EB',
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});