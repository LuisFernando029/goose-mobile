// app/cliente-detalhes.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Mail,
    Package,
    Phone,
    TrendingUp,
    User
} from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ItemPedido {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: string;
  data: string;
  total: number;
  itens: ItemPedido[];
  mesa: number;
}

interface Cliente {
  id: number;
  nome: string;
  totalGasto: number;
  visitas: number;
  ultimaVisita: string;
  telefone?: string;
  email?: string;
  pedidos: Pedido[];
}

export default function ClienteDetalhesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Recupera os dados do cliente passados como parâmetro
  const cliente: Cliente = JSON.parse(params.cliente as string);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataCompleta = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const ticketMedio = cliente.totalGasto / cliente.visitas;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Cliente</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Informações do Cliente */}
        <View style={styles.infoSection}>
          <View style={styles.clienteHeader}>
            <View style={styles.avatar}>
              <User size={24} color="#FFF" />
            </View>
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteNome}>{cliente.nome}</Text>
              <Text style={styles.clienteMeta}>
                {cliente.visitas} {cliente.visitas === 1 ? 'visita' : 'visitas'} • 
                Cliente desde {formatarData(cliente.pedidos[cliente.pedidos.length - 1]?.data || cliente.ultimaVisita)}
              </Text>
            </View>
          </View>

          {/* Contato */}
          {(cliente.telefone || cliente.email) && (
            <View style={styles.contatoSection}>
              {cliente.telefone && (
                <View style={styles.contatoItem}>
                  <Phone size={16} color="#9CA3AF" />
                  <Text style={styles.contatoText}>{cliente.telefone}</Text>
                </View>
              )}
              {cliente.email && (
                <View style={styles.contatoItem}>
                  <Mail size={16} color="#9CA3AF" />
                  <Text style={styles.contatoText}>{cliente.email}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Estatísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#22C55E" />
            <Text style={styles.statValue}>{formatarMoeda(cliente.totalGasto)}</Text>
            <Text style={styles.statLabel}>Total Gasto</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{formatarMoeda(ticketMedio)}</Text>
            <Text style={styles.statLabel}>Ticket Médio</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{cliente.visitas}</Text>
            <Text style={styles.statLabel}>Visitas</Text>
          </View>
        </View>

        {/* Histórico Completo de Pedidos */}
        <View style={styles.historicoSection}>
          <Text style={styles.sectionTitle}>Histórico Completo de Pedidos</Text>
          
          {cliente.pedidos
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .map((pedido, index) => (
            <View key={pedido.id} style={styles.pedidoCard}>
              <View style={styles.pedidoHeader}>
                <View style={styles.pedidoInfo}>
                  <Text style={styles.pedidoData}>
                    {formatarDataCompleta(pedido.data)}
                  </Text>
                  <Text style={styles.pedidoMesa}>Mesa {pedido.mesa}</Text>
                </View>
                <Text style={styles.pedidoTotal}>
                  {formatarMoeda(pedido.total)}
                </Text>
              </View>

              {/* Itens do Pedido */}
              <View style={styles.itensContainer}>
                {pedido.itens.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Package size={14} color="#9CA3AF" />
                      <Text style={styles.itemNome}>
                        {item.quantidade}x {item.nome}
                      </Text>
                    </View>
                    <Text style={styles.itemPreco}>
                      {formatarMoeda(item.preco * item.quantidade)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Separador entre pedidos */}
              {index < cliente.pedidos.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    padding: 16,
    paddingBottom: 50,
  },
  infoSection: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  clienteMeta: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  contatoSection: {
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
    paddingTop: 12,
  },
  contatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contatoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  historicoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  pedidoCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoData: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  pedidoMesa: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  pedidoTotal: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itensContainer: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemNome: {
    color: '#D4D4D8',
    fontSize: 14,
    marginLeft: 8,
  },
  itemPreco: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#3F3F46',
    marginVertical: 12,
  },
});