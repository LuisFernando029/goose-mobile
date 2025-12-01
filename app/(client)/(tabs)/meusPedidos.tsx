import { Clock, Package, ChefHat, CheckCircle, XCircle, RefreshCw, Trash2, Receipt } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type PedidoStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

interface ItemPedido {
  id: number;
  quantity: number;
  unitPrice: string;
  notes: string | null;
  product: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    category: string | null;
  };
}

interface Pedido {
  id: number;
  customerName: string;
  status: PedidoStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  table: {
    id: string;
    label: string;
    seats: number;
  } | null;
  items: ItemPedido[];
}

const BASE_URL = "http://192.168.15.68:4000";

export default function MeusPedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);

  useEffect(() => {
    loadClientData();
  }, []);

  useEffect(() => {
    if (clientData?.nome) {
      loadPedidos();
    }
  }, [clientData]);

  // Atualiza quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (clientData?.nome) {
        loadPedidos();
      }
    }, [clientData])
  );

  const loadClientData = async () => {
    try {
      const data = await AsyncStorage.getItem('clientData');
      if (data) {
        setClientData(JSON.parse(data));
      } else {
        setError('Dados do cliente não encontrados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      setError('Erro ao carregar dados do cliente');
    }
  };

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/orders`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data = await response.json();
      
      // Filtra apenas os pedidos do cliente atual
      const pedidosDoCliente = data.filter(
        (pedido: Pedido) => pedido.customerName === clientData.nome
      );

      // Ordena por data (mais recentes primeiro)
      pedidosDoCliente.sort((a: Pedido, b: Pedido) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPedidos(pedidosDoCliente);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      Alert.alert("Erro", `Não foi possível carregar seus pedidos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelarPedido = async (pedido: Pedido) => {
    // Verifica se o pedido pode ser cancelado
    if (pedido.status === 'delivered' || pedido.status === 'cancelled') {
      Alert.alert(
        'Não é possível cancelar',
        `Este pedido já foi ${pedido.status === 'delivered' ? 'entregue' : 'cancelado'}.`
      );
      return;
    }

    if (pedido.status === 'ready') {
      Alert.alert(
        'Pedido Pronto',
        'Este pedido já está pronto. Tem certeza que deseja cancelá-lo?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim, Cancelar', style: 'destructive', onPress: () => confirmarCancelamento(pedido) }
        ]
      );
      return;
    }

    confirmarCancelamento(pedido);
  };

  const confirmarCancelamento = (pedido: Pedido) => {
    const total = calcularTotal(pedido.items);
    
    Alert.alert(
      'Cancelar Pedido',
      `Tem certeza que deseja cancelar o pedido #${pedido.id}?\n\nTotal: R$ ${total.toFixed(2)}\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => executarCancelamento(pedido.id)
        }
      ]
    );
  };

  const executarCancelamento = async (pedidoId: number) => {
    try {
      setCancelando(pedidoId);

      const response = await fetch(`${BASE_URL}/orders/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cancelar pedido');
      }

      // Atualiza o pedido localmente
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId
            ? { ...p, status: 'cancelled' as PedidoStatus }
            : p
        )
      );

      Alert.alert(
        'Pedido Cancelado',
        `O pedido #${pedidoId} foi cancelado com sucesso.`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível cancelar o pedido: ${errorMessage}`);
    } finally {
      setCancelando(null);
    }
  };

  const podeCancelar = (status: PedidoStatus) => {
    return ['pending', 'preparing', 'ready'].includes(status);
  };

  const getStatusInfo = (status: PedidoStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: '#9CA3AF',
          bgColor: 'rgba(156, 163, 175, 0.1)',
          text: 'Pendente',
          icon: Clock,
          description: 'Aguardando confirmação'
        };
      case 'preparing':
        return {
          color: '#EAB308',
          bgColor: 'rgba(234, 179, 8, 0.1)',
          text: 'Preparando',
          icon: ChefHat,
          description: 'Sendo preparado'
        };
      case 'ready':
        return {
          color: '#22C55E',
          bgColor: 'rgba(34, 197, 94, 0.1)',
          text: 'Pronto',
          icon: CheckCircle,
          description: 'Pronto para servir'
        };
      case 'delivered':
        return {
          color: '#2563EB',
          bgColor: 'rgba(37, 99, 235, 0.1)',
          text: 'Entregue',
          icon: CheckCircle,
          description: 'Pedido entregue'
        };
      case 'cancelled':
        return {
          color: '#DC2626',
          bgColor: 'rgba(220, 38, 38, 0.1)',
          text: 'Cancelado',
          icon: XCircle,
          description: 'Pedido cancelado'
        };
    }
  };

  const calcularTotal = (items: ItemPedido[]) => {
    return items.reduce((total, item) => {
      return total + (Number(item.unitPrice) * item.quantity);
    }, 0);
  };

  const calcularTotalComanda = () => {
    // Soma apenas pedidos que não foram cancelados
    return pedidos
      .filter(p => p.status !== 'cancelled')
      .reduce((total, pedido) => {
        return total + calcularTotal(pedido.items);
      }, 0);
  };

  const formatarData = (dateString: string) => {
    const date = new Date(dateString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const sameDay = date.toDateString() === hoje.toDateString();
    const wasYesterday = date.toDateString() === ontem.toDateString();

    const time = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (sameDay) {
      return `Hoje às ${time}`;
    } else if (wasYesterday) {
      return `Ontem às ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const pedidosAtivos = pedidos.filter(p => 
    ['pending', 'preparing', 'ready'].includes(p.status)
  );

  const pedidosFinalizados = pedidos.filter(p => 
    ['delivered', 'cancelled'].includes(p.status)
  );

  const totalComanda = calcularTotalComanda();
  const quantidadePedidosValidos = pedidos.filter(p => p.status !== 'cancelled').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Carregando seus pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !clientData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Package color="#DC2626" size={48} />
          <Text style={styles.errorTitle}>Erro</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Pedidos</Text>
            <Text style={styles.subtitle}>
              {clientData?.nome || 'Cliente'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadPedidos}
            disabled={loading}
          >
            <RefreshCw size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Total da Comanda */}
        {totalComanda > 0 && (
          <View style={styles.comandaCard}>
            <View style={styles.comandaHeader}>
              <Receipt size={24} color="#22C55E" />
              <Text style={styles.comandaTitle}>Total da Comanda</Text>
            </View>
            <View style={styles.comandaBody}>
              <View style={styles.comandaInfo}>
                <Text style={styles.comandaLabel}>Pedidos válidos:</Text>
                <Text style={styles.comandaValue}>{quantidadePedidosValidos}</Text>
              </View>
              <View style={styles.comandaDivider} />
              <View style={styles.comandaTotalContainer}>
                <Text style={styles.comandaTotalLabel}>Total a Pagar:</Text>
                <Text style={styles.comandaTotalValue}>R$ {totalComanda.toFixed(2)}</Text>
              </View>
            </View>
            <Text style={styles.comandaNote}>
              * Pedidos cancelados não são contabilizados
            </Text>
          </View>
        )}

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pedidosAtivos.length}</Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>
              {pedidos.filter(p => p.status === 'delivered').length}
            </Text>
            <Text style={styles.statLabel}>Entregues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>
              {pedidos.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Pedidos Ativos */}
        {pedidosAtivos.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ChefHat size={20} color="#FFF" />
              <Text style={styles.sectionTitle}>Pedidos Ativos</Text>
            </View>

            {pedidosAtivos.map((pedido) => {
              const statusInfo = getStatusInfo(pedido.status);
              const StatusIcon = statusInfo.icon;
              const total = calcularTotal(pedido.items);
              const podeCancelarPedido = podeCancelar(pedido.status);
              const estaCancelando = cancelando === pedido.id;

              return (
                <View key={pedido.id} style={styles.pedidoCard}>
                  <View style={styles.pedidoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
                      {pedido.table && (
                        <Text style={styles.pedidoMesa}>📍 {pedido.table.label}</Text>
                      )}
                      <View style={styles.pedidoData}>
                        <Clock size={14} color="#9CA3AF" />
                        <Text style={styles.pedidoDataText}>
                          {formatarData(pedido.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                      <StatusIcon size={16} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pedidoBody}>
                    {pedido.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemPrice}>
                          R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    {pedido.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>💬 {pedido.notes}</Text>
                      </View>
                    )}

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
                    </View>

                    {/* Status Description */}
                    <View style={[styles.statusDescription, { backgroundColor: statusInfo.bgColor }]}>
                      <Text style={[styles.statusDescriptionText, { color: statusInfo.color }]}>
                        {statusInfo.description}
                      </Text>
                    </View>

                    {/* Botão Cancelar */}
                    {podeCancelarPedido && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => cancelarPedido(pedido)}
                        disabled={estaCancelando}
                      >
                        {estaCancelando ? (
                          <ActivityIndicator size="small" color="#DC2626" />
                        ) : (
                          <>
                            <Trash2 size={16} color="#DC2626" />
                            <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Pedidos Finalizados */}
        {pedidosFinalizados.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color="#FFF" />
              <Text style={styles.sectionTitle}>Histórico</Text>
            </View>

            {pedidosFinalizados.map((pedido) => {
              const statusInfo = getStatusInfo(pedido.status);
              const StatusIcon = statusInfo.icon;
              const total = calcularTotal(pedido.items);

              return (
                <View key={pedido.id} style={[styles.pedidoCard, styles.pedidoFinalizado]}>
                  <View style={styles.pedidoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
                      {pedido.table && (
                        <Text style={styles.pedidoMesa}>📍 {pedido.table.label}</Text>
                      )}
                      <View style={styles.pedidoData}>
                        <Clock size={14} color="#9CA3AF" />
                        <Text style={styles.pedidoDataText}>
                          {formatarData(pedido.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                      <StatusIcon size={16} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pedidoBody}>
                    {pedido.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemPrice}>
                          R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Empty State */}
        {pedidos.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Package size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptyText}>
              Seus pedidos aparecerão aqui após você fazer o primeiro pedido
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scroll: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
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
  comandaCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  comandaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  comandaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  comandaBody: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
  },
  comandaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  comandaLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  comandaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  comandaDivider: {
    height: 1,
    backgroundColor: '#3F3F46',
    marginVertical: 12,
  },
  comandaTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comandaTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  comandaTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  comandaNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  pedidoCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  pedidoFinalizado: {
    opacity: 0.7,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  pedidoMesa: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  pedidoData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pedidoDataText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoBody: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    minWidth: 30,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  notesContainer: {
    backgroundColor: '#18181B',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
  },
  statusDescription: {
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  statusDescriptionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
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
    paddingHorizontal: 24,
  },
});