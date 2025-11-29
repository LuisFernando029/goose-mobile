// app/(tabs)/historico-clientes.tsx
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, DollarSign, Package, Search, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

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
  pedidos: Pedido[];
  telefone?: string;
  email?: string;
}

// Mock de dados expandido com mais histórico
const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: 'João Silva',
    totalGasto: 1250.50,
    visitas: 8,
    ultimaVisita: '2024-01-15',
    telefone: '(11) 99999-9999',
    email: 'joao.silva@email.com',
    pedidos: [
      {
        id: '1',
        data: '2024-01-15 20:30',
        total: 320.80,
        mesa: 5,
        itens: [
          { id: '1', nome: 'Vinho Tinto Reserva', quantidade: 1, preco: 89.9 },
          { id: '2', nome: 'Tábua de Queijos', quantidade: 1, preco: 45.0 },
          { id: '3', nome: 'Cerveja IPA', quantidade: 3, preco: 18.0 },
        ],
      },
      {
        id: '2',
        data: '2024-01-10 19:00',
        total: 210.00,
        mesa: 3,
        itens: [
          { id: '4', nome: 'Vinho Branco Seco', quantidade: 1, preco: 75.0 },
          { id: '5', nome: 'Bruschetta', quantidade: 1, preco: 28.0 },
        ],
      },
      {
        id: '3',
        data: '2024-01-05 21:15',
        total: 450.25,
        mesa: 8,
        itens: [
          { id: '6', nome: 'Espumante Brut', quantidade: 1, preco: 95.0 },
          { id: '7', nome: 'Tábua de Frios Premium', quantidade: 1, preco: 65.0 },
        ],
      },
    ],
  },
  {
    id: 2,
    nome: 'Maria Santos',
    totalGasto: 890.25,
    visitas: 5,
    ultimaVisita: '2024-01-14',
    telefone: '(11) 98888-8888',
    email: 'maria.santos@email.com',
    pedidos: [
      {
        id: '4',
        data: '2024-01-14 19:45',
        total: 215.50,
        mesa: 3,
        itens: [
          { id: '8', nome: 'Vinho Branco Seco', quantidade: 1, preco: 75.0 },
          { id: '9', nome: 'Bruschetta', quantidade: 2, preco: 28.0 },
        ],
      },
      {
        id: '5',
        data: '2024-01-08 20:30',
        total: 180.75,
        mesa: 2,
        itens: [
          { id: '10', nome: 'Caipirinha', quantidade: 3, preco: 18.0 },
          { id: '11', nome: 'Porção de Batata', quantidade: 1, preco: 35.0 },
        ],
      },
    ],
  },
  // ... outros clientes (mantenha os demais)
];

export default function HistoricoClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const navegarParaDetalhes = (cliente: Cliente) => {
    // Navega para a tela de detalhes passando o cliente como parâmetro
    router.push({
      pathname: '/cliente-detalhes',
      params: { 
        cliente: JSON.stringify(cliente),
        clienteNome: cliente.nome 
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Histórico de Clientes</Text>
          <Text style={styles.subtitle}>
            Consulte o histórico de consumo e visitas
          </Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de Clientes</Text>
            <Text style={styles.statValue}>{clientes.length}</Text>
            <User color="#9CA3AF" size={22} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Faturamento Total</Text>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>
              {formatarMoeda(clientes.reduce((total, cliente) => total + cliente.totalGasto, 0))}
            </Text>
            <DollarSign color="#22C55E" size={22} />
          </View>
        </View>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={18} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar cliente pelo nome..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Lista de Clientes */}
        <View style={styles.clientesContainer}>
          {filteredClientes.map((cliente) => (
            <View key={cliente.id} style={styles.card}>
              {/* Header do Cliente */}
              <View style={styles.cardHeader}>
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteNome}>{cliente.nome}</Text>
                  <View style={styles.clienteMeta}>
                    <Text style={styles.clienteVisitas}>
                      {cliente.visitas} {cliente.visitas === 1 ? 'visita' : 'visitas'}
                    </Text>
                    <Text style={styles.clienteTotal}>
                      {formatarMoeda(cliente.totalGasto)} total
                    </Text>
                  </View>
                </View>
                <View style={styles.ultimaVisita}>
                  <Calendar size={14} color="#9CA3AF" />
                  <Text style={styles.ultimaVisitaText}>
                    {formatarData(cliente.ultimaVisita)}
                  </Text>
                </View>
              </View>

              {/* Último Pedido */}
              <View style={styles.pedidoSection}>
                <Text style={styles.pedidoTitle}>Última Visita</Text>
                {cliente.pedidos.slice(0, 1).map((pedido) => (
                  <View key={pedido.id} style={styles.pedidoCard}>
                    <View style={styles.pedidoHeader}>
                      <Text style={styles.pedidoData}>
                        {new Date(pedido.data).toLocaleString('pt-BR')}
                      </Text>
                      <Text style={styles.pedidoMesa}>Mesa {pedido.mesa}</Text>
                    </View>

                    {/* Itens do Pedido */}
                    <View style={styles.itensContainer}>
                      {pedido.itens.slice(0, 2).map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Package size={12} color="#9CA3AF" />
                            <Text style={styles.itemNome}>
                              {item.quantidade}x {item.nome}
                            </Text>
                          </View>
                          <Text style={styles.itemPreco}>
                            {formatarMoeda(item.preco * item.quantidade)}
                          </Text>
                        </View>
                      ))}
                      {pedido.itens.length > 2 && (
                        <Text style={styles.maisItens}>
                          +{pedido.itens.length - 2} outros itens
                        </Text>
                      )}
                    </View>

                    {/* Total do Pedido */}
                    <View style={styles.pedidoTotal}>
                      <Text style={styles.pedidoTotalLabel}>Total do pedido:</Text>
                      <Text style={styles.pedidoTotalValue}>
                        {formatarMoeda(pedido.total)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Ações */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.detalhesButton}
                  onPress={() => navegarParaDetalhes(cliente)}
                >
                  <Text style={styles.detalhesButtonText}>Ver Histórico Completo</Text>
                  <ArrowRight size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredClientes.length === 0 && (
            <View style={styles.emptyContainer}>
              <User color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ... (mantenha os mesmos estilos, apenas adicione este novo)
const styles = StyleSheet.create({
  // ... (todos os estilos anteriores permanecem iguais)
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  scroll: {
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#27272A',
    width: width * 0.44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
    padding: 14,
    marginBottom: 14,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#27272A',
    color: '#FFF',
    borderRadius: 8,
    paddingLeft: 36,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#52525B',
  },
  clientesContainer: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#27272A',
    width: width * 0.9,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  clienteMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  clienteVisitas: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  clienteTotal: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  ultimaVisita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ultimaVisitaText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  pedidoSection: {
    marginBottom: 16,
  },
  pedidoTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pedidoCard: {
    backgroundColor: '#3F3F46',
    borderRadius: 8,
    padding: 12,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pedidoData: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  pedidoMesa: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  itensContainer: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemNome: {
    color: '#D4D4D8',
    fontSize: 12,
  },
  itemPreco: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  maisItens: {
    color: '#9CA3AF',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  pedidoTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#52525B',
  },
  pedidoTotalLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  pedidoTotalValue: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
    paddingTop: 12,
  },
  detalhesButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  detalhesButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
  },
});